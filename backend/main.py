import sqlite3
import uuid
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database initialization
def init_db():
    conn = sqlite3.connect('queue.db')
    c = conn.cursor()
    
    # Create customers table
    c.execute('''
        CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            token_number INTEGER NOT NULL,
            service_type TEXT NOT NULL,
            status TEXT NOT NULL,
            check_in_time TIMESTAMP NOT NULL,
            estimated_wait_time INTEGER NOT NULL,
            start_service_time TIMESTAMP,
            end_service_time TIMESTAMP,
            teller_id TEXT
        )
    ''')
    
    # Create tellers table
    c.execute('''
        CREATE TABLE IF NOT EXISTS tellers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            status TEXT NOT NULL,
            customers_served INTEGER DEFAULT 0,
            service_types TEXT NOT NULL
        )
    ''')
    
    # Insert default tellers if they don't exist
    c.execute('SELECT COUNT(*) FROM tellers')
    if c.fetchone()[0] == 0:
        default_tellers = [
            ('1', 'Jean Bosco', 'available', 0, 'international-transfer,forex'),
            ('2', 'Marie Claire', 'available', 0, 'international-transfer,domestic-transfer'),
            ('3', 'Emmanuel', 'available', 0, 'domestic-transfer,account-services')
        ]
        c.executemany(
            'INSERT INTO tellers (id, name, status, customers_served, service_types) VALUES (?, ?, ?, ?, ?)',
            default_tellers
        )
    
    # Create feedback table
    c.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id TEXT PRIMARY KEY,
            category TEXT NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT,
            created_at TIMESTAMP NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Pydantic models for request/response validation
class CustomerBase(BaseModel):
    name: str
    phone_number: str
    service_type: str

class Customer(CustomerBase):
    id: str
    token_number: int
    status: str
    check_in_time: datetime
    estimated_wait_time: int
    start_service_time: datetime | None = None
    end_service_time: datetime | None = None
    teller_id: str | None = None

class CustomerStatusUpdate(BaseModel):
    status: str
    teller_id: str | None = None

class FeedbackBase(BaseModel):
    category: str
    rating: int
    comment: str | None = None

class Feedback(FeedbackBase):
    id: str
    created_at: datetime

# API endpoints
@app.post("/customers/", response_model=Customer)
async def create_customer(customer: CustomerBase):
    conn = sqlite3.connect('queue.db')
    c = conn.cursor()
    
    try:
        # Remove spaces from phone number
        cleaned_phone = customer.phone_number.replace(" ", "")
        # Generate token number
        c.execute("SELECT MAX(token_number) FROM customers WHERE DATE(check_in_time) = DATE('now')")
        max_token = c.fetchone()[0]
        token_number = (max_token or 0) + 1
        
        # Calculate estimated wait time (simplified version)
        estimated_wait_time = 15  # Default 15 minutes
        
        customer_id = str(uuid.uuid4())
        now = datetime.now()
        
        c.execute('''
            INSERT INTO customers (
                id, name, phone_number, token_number, service_type,
                status, check_in_time, estimated_wait_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            customer_id, customer.name, cleaned_phone,
            token_number, customer.service_type, 'waiting',
            now, estimated_wait_time
        ))
        
        conn.commit()
        
        return Customer(
            id=customer_id,
            name=customer.name,
            phone_number=cleaned_phone,
            token_number=token_number,
            service_type=customer.service_type,
            status='waiting',
            check_in_time=now,
            estimated_wait_time=estimated_wait_time
        )
    
    finally:
        conn.close()

@app.get("/customers/", response_model=list[Customer])
async def get_customers():
    conn = sqlite3.connect('queue.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    try:
        c.execute('''
            SELECT c.*, t.name as teller_name 
            FROM customers c 
            LEFT JOIN tellers t ON c.teller_id = t.id 
            WHERE DATE(c.check_in_time) = DATE('now')
        ''')
        customers = c.fetchall()
        
        return [dict(customer) for customer in customers]
    
    finally:
        conn.close()

@app.put("/customers/{customer_id}/status")
async def update_customer_status(customer_id: str, update: CustomerStatusUpdate):
    conn = sqlite3.connect('queue.db')
    c = conn.cursor()
    
    try:
        # First check if customer exists
        c.execute("SELECT id FROM customers WHERE id = ?", (customer_id,))
        if not c.fetchone():
            raise HTTPException(status_code=404, detail="Customer not found")
        
        now = datetime.now()
        
        if update.status == 'serving':
            c.execute('''
                UPDATE customers 
                SET status = ?, start_service_time = ?, teller_id = ?
                WHERE id = ?
            ''', (update.status, now, update.teller_id, customer_id))
            
            if update.teller_id:
                c.execute('''
                    UPDATE tellers 
                    SET status = 'serving'
                    WHERE id = ?
                ''', (update.teller_id,))
                
        elif update.status in ['completed', 'cancelled']:
            c.execute('''
                UPDATE customers 
                SET status = ?, end_service_time = ?
                WHERE id = ?
            ''', (update.status, now, customer_id))
            
            if update.status == 'completed':
                c.execute('''
                    UPDATE tellers 
                    SET status = 'available', customers_served = customers_served + 1
                    WHERE id = (SELECT teller_id FROM customers WHERE id = ?)
                ''', (customer_id,))
        else:
            c.execute('''
                UPDATE customers 
                SET status = ?
                WHERE id = ?
            ''', (update.status, customer_id))
        
        conn.commit()
        return {"message": "Status updated successfully"}
    
    finally:
        conn.close()

@app.post("/feedback/", response_model=Feedback)
async def create_feedback(feedback: FeedbackBase):
    conn = sqlite3.connect('queue.db')
    c = conn.cursor()
    
    try:
        feedback_id = str(uuid.uuid4())
        now = datetime.now()
        
        c.execute('''
            INSERT INTO feedback (
                id, category, rating,
                comment, created_at
            ) VALUES (?, ?, ?, ?, ?)
        ''', (
            feedback_id, feedback.category,
            feedback.rating, feedback.comment, now
        ))
        
        conn.commit()
        
        return Feedback(
            id=feedback_id,
            category=feedback.category,
            rating=feedback.rating,
            comment=feedback.comment,
            created_at=now
        )
    
    finally:
        conn.close()

@app.get("/feedback/", response_model=list[Feedback])
async def get_feedback():
    conn = sqlite3.connect('queue.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    try:
        c.execute('''
            SELECT * FROM feedback
            ORDER BY created_at DESC
        ''')
        feedback = c.fetchall()
        
        return [dict(f) for f in feedback]
    
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8700)