import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional


class ScanHistoryDB:
    def __init__(self, db_path: str = "scan_history.db"):
        self.db_path = db_path
        self.init_db()
    
    def init_db(self):
        """Initialize the database and create the scan_history table if it doesn't exist."""
        with sqlite3.connect(self.db_path) as conn:
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
            conn.commit()
    
    def save_scan(self, input_type: str, risk_score: int, verdict: str, risk_level: str, 
                  signals: List[str], ai_explanation: Optional[str]):
        """Save a scan result to the database."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO scan_history 
                    (input_type, risk_score, verdict, risk_level, signals, ai_explanation)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (input_type, risk_score, verdict, risk_level, json.dumps(signals), ai_explanation))
                conn.commit()
        except Exception as e:
            # Log the error but don't break the scan process
            print(f"Error saving scan to database: {e}")
    
    def get_recent_scans(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieve the most recent scans from the database."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row  # Enable column access by name
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT input_type, risk_score, verdict, risk_level, 
                           signals, ai_explanation, created_at
                    FROM scan_history
                    ORDER BY created_at DESC
                    LIMIT ?
                """, (limit,))
                
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
            print(f"Error retrieving scans from database: {e}")
            return []


# Global instance of the database
db = ScanHistoryDB()