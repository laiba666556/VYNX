import sqlite3
import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from contextlib import closing


# Configure logging
logger = logging.getLogger(__name__)


class ScanHistoryDB:
    def __init__(self, db_path: str = "scan_history.db"):
        self.db_path = db_path
        self.init_db()
    
    def init_db(self):
        """Initialize the database and create the scan_history table if it doesn't exist."""
        with closing(sqlite3.connect(self.db_path)) as conn, conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scan_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    input_type TEXT NOT NULL,
                    risk_score INTEGER NOT NULL,
                    verdict TEXT NOT NULL,
                    risk_level TEXT NOT NULL,
                    signals TEXT NOT NULL,  -- Stored as JSON
                    ai_explanation TEXT
                )
            """)
            columns = {row[1] for row in cursor.execute("PRAGMA table_info(scan_history)").fetchall()}
            if "session_id" not in columns:
                cursor.execute("ALTER TABLE scan_history ADD COLUMN session_id TEXT")
            conn.commit()
    
    def save_scan(self, input_type: str, risk_score: int, verdict: str, risk_level: str, 
                  signals: List[str], ai_explanation: Optional[str], session_id: Optional[str] = None):
        """Save a scan result to the database."""
        try:
            with closing(sqlite3.connect(self.db_path)) as conn, conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO scan_history 
                    (input_type, risk_score, verdict, risk_level, signals, ai_explanation, session_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (input_type, risk_score, verdict, risk_level, json.dumps(signals), ai_explanation, session_id))
                conn.commit()
        except Exception as e:
            # Log the error but don't break the scan process
            logger.error(f"Error saving scan to database: {e}")
    
    def get_recent_scans(self, limit: int = 20, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve the most recent scans, optionally scoped to one session."""
        try:
            with closing(sqlite3.connect(self.db_path)) as conn, conn:
                conn.row_factory = sqlite3.Row  # Enable column access by name
                cursor = conn.cursor()
                query = """
                    SELECT input_type, risk_score, verdict, risk_level, 
                           signals, ai_explanation, created_at
                    FROM scan_history
                """
                params: List[Any] = []
                if session_id is not None:
                    query += " WHERE session_id = ?"
                    params.append(session_id)
                query += " ORDER BY created_at DESC LIMIT ?"
                params.append(limit)
                cursor.execute(query, tuple(params))
                
                rows = cursor.fetchall()
                scans = []
                for row in rows:
                    scan = {
                        "input_type": row["input_type"],
                        "risk_score": row["risk_score"],
                        "verdict": row["verdict"],
                        "risk_level": row["risk_level"],
                        "signals": json.loads(row["signals"]),  # Deserialize JSON
                        "ai_explanation": row["ai_explanation"],
                        "created_at": row["created_at"]
                    }
                    scans.append(scan)
                return scans
        except Exception as e:
            # Log the error but return empty list
            logger.error(f"Error retrieving scans from database: {e}")
            return []

    def get_stats(self, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Aggregate scan counts for the dashboard, optionally scoped to one session."""
        verdicts = ["SAFE", "SPAM", "SUSPICIOUS", "PHISHING", "UNKNOWN"]
        levels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        verdict_counts = {verdict: 0 for verdict in verdicts}
        risk_level_counts = {level: 0 for level in levels}
        stats = {
            "total_scans": 0,
            "verdict_counts": verdict_counts,
            "risk_level_counts": risk_level_counts,
            "threats_blocked": 0,
            "safe_pct": 0.0,
            "last_scan_at": None,
        }

        try:
            with closing(sqlite3.connect(self.db_path)) as conn, conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                select_parts = [
                    "COUNT(*) AS total_scans",
                    "MAX(created_at) AS last_scan_at",
                ]
                select_parts += [
                    f"SUM(CASE WHEN verdict = '{verdict}' THEN 1 ELSE 0 END) AS verdict_{verdict.lower()}"
                    for verdict in verdicts
                ]
                select_parts += [
                    f"SUM(CASE WHEN risk_level = '{level}' THEN 1 ELSE 0 END) AS level_{level.lower()}"
                    for level in levels
                ]
                query = f"SELECT {', '.join(select_parts)} FROM scan_history"
                if session_id is not None:
                    query += " WHERE session_id = ?"
                    cursor.execute(query, (session_id,))
                else:
                    cursor.execute(query)

                row = cursor.fetchone()
                total = row["total_scans"] or 0
                stats["total_scans"] = total
                stats["last_scan_at"] = row["last_scan_at"]
                for verdict in verdicts:
                    verdict_counts[verdict] = row[f"verdict_{verdict.lower()}"] or 0
                for level in levels:
                    risk_level_counts[level] = row[f"level_{level.lower()}"] or 0
                stats["threats_blocked"] = verdict_counts["PHISHING"] + verdict_counts["SUSPICIOUS"]
                stats["safe_pct"] = round((verdict_counts["SAFE"] / total) * 100, 1) if total else 0.0
        except Exception as e:
            logger.error(f"Error retrieving stats from database: {e}")

        return stats


# Global instance of the database
db = ScanHistoryDB()