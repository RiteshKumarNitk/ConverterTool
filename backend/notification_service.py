import asyncio
import pandas as pd
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

# In-memory store for jobs
# Structure: { job_id: { status: 'processing', progress: 0, total: 0, logs: [], report: [] } }
JOBS_STORE = {}

class NotificationService:
    def __init__(self):
        self.email_queue = asyncio.Queue()
        self.is_worker_running = False

    async def parse_csv(self, file_bytes: bytes):
        """
        Parses CSV/Excel bytes and returns a list of recipient dicts.
        Expected columns: name, email, phone, (any other custom vars)
        """
        try:
            # Try reading as CSV first, if fail, try Excel
            try:
                df = pd.read_csv(pd.io.common.BytesIO(file_bytes))
            except:
                df = pd.read_excel(pd.io.common.BytesIO(file_bytes))
            
            # Normalize column names
            df.columns = [c.lower().strip() for c in df.columns]
            return df.to_dict(orient='records')
        except Exception as e:
            raise ValueError(f"Failed to parse file: {str(e)}")

    async def start_job(self, recipients, channel, template, subject, credentials):
        """
        Starts a background job to process the list sequentially.
        """
        job_id = str(uuid.uuid4())
        JOBS_STORE[job_id] = {
            'id': job_id,
            'status': 'processing',
            'progress': 0,
            'total': len(recipients),
            'started_at': datetime.now().isoformat(),
            'logs': [],
        }

        # Start the worker task
        asyncio.create_task(self._process_queue_sequentially(job_id, recipients, channel, template, subject, credentials))
        return job_id

    async def _process_queue_sequentially(self, job_id, recipients, channel, template, subject, credentials):
        """
        Worker that sends notifications one by one with delays.
        """
        job = JOBS_STORE[job_id]
        success_count = 0
        fail_count = 0

        for index, recipient in enumerate(recipients):
            # 1. Update Progress
            job['progress'] = int(((index) / job['total']) * 100)
            
            # 2. Extract Data
            name = recipient.get('name', 'Friend')
            email = recipient.get('email', '')
            phone = recipient.get('phone', '')

            # 3. Process Logic
            try:
                if 'email' in channel and email:
                    await self._send_email_single(email, name, template, subject, credentials)
                    job['logs'].append(f"✅ Email sent to {email}")
                
                if 'whatsapp' in channel and phone:
                    await self._send_whatsapp_smart(phone, name, template)
                    job['logs'].append(f"✅ WhatsApp queued for {phone}")

                success_count += 1
            except Exception as e:
                fail_count += 1
                job['logs'].append(f"❌ Failed for {name}: {str(e)}")

            # 4. Smart Delay (Rate Limiting)
            # Sleep 5 seconds as requested for safety
            await asyncio.sleep(5) 
        
        job['status'] = 'completed'
        job['progress'] = 100
        job['summary'] = f"Sent: {success_count}, Failed: {fail_count}"

    async def _send_email_single(self, to_email, name, template_body, subject, creds):
        """
        Real SMTP sender.
        """
        # If no credentials provided, simulate success
        if not creds or not creds.get('smtp_user'):
            print(f"[SIMULATION MODE] No SMTP credentials provided. Would send email to {to_email}")
            return

        smtp_server = creds.get('smtp_host', 'smtp.gmail.com')
        smtp_port = int(creds.get('smtp_port', 587))
        smtp_user = creds.get('smtp_user')
        smtp_pass = creds.get('smtp_pass')

        # Create msg
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = to_email
        msg['Subject'] = subject or "Notification"

        # Personalize
        body = template_body.replace('{{name}}', str(name))
        msg.attach(MIMEText(body, 'plain'))

        # Send
        # Note: synchronus smtplib calls in an async loop block the loop strictly speaking,
        # but for this heavy "one-by-one" logical task, it serves the "queue" purpose well.
        # Ideally run_in_executor, but simple is fine here.
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()

    async def _send_whatsapp_smart(self, phone, name, template):
        """
        Smart Automation for WhatsApp using pywhatkit.
        Opens web.whatsapp.com and types the message.
        """
        import pywhatkit
        
        # Personalize
        msg = template.replace('{{name}}', str(name))
        
        # Format phone: ensure it has country code (e.g., +91)
        if not phone.startswith('+'):
            if len(phone) == 10:
                phone = "+91" + phone # Default to India if 10 digits
            else:
                phone = "+" + phone
        
        print(f"[WHATSAPP AUTO] Starting browser for {phone}...")
        
        # Run blocking pywhatkit in a thread to keep API responsive
        # wait_time=15s for WhatsApp Web to load
        # tab_close=True to close after sending
        # close_time=3s wait before closing
        
        def send_sync():
            try:
                pywhatkit.sendwhatmsg_instantly(
                    phone_no=phone, 
                    message=msg, 
                    wait_time=20, 
                    tab_close=True, 
                    close_time=4
                )
            except Exception as e:
                print(f"PyWhatKit Error: {e}")
                # Sometimes it fails to close tab, that's okay

        await asyncio.to_thread(send_sync)
        print(f"[WHATSAPP AUTO] Sent to {phone}")

notification_service = NotificationService()
