<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px; border-radius: 8px;">
    <div style="background: white; padding: 30px; border-radius: 8px; border-left: 4px solid #EF4444;">
        <h2 style="margin: 0 0 15px 0; color: #EF4444;">🚨 Copy-Paste Attempt Alert</h2>
        
        <p style="margin: 0 0 20px 0; color: #333; line-height: 1.6;">
            An intern has made multiple copy-paste attempts while working on a task. This may indicate academic integrity concerns.
        </p>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #F59E0B;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;"><strong>Intern:</strong> {{ $internName }} ({{ $internEmail }})</p>
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;"><strong>Paste Attempts:</strong> <span style="color: #EF4444; font-weight: bold;">{{ $pasteCount }}x</span></p>
            <p style="margin: 0; color: #666; font-size: 14px;"><strong>Reported At:</strong> {{ $time }}</p>
        </div>

        <p style="margin: 20px 0; color: #555; line-height: 1.6;">
            <strong>Action Recommended:</strong>
        </p>
        <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #555;">
            <li style="margin-bottom: 8px;">Review the intern's code submission</li>
            <li style="margin-bottom: 8px;">Schedule a discussion with the intern to understand the context</li>
            <li style="margin-bottom: 8px;">Check activity logs for other suspicious behavior</li>
            <li>Consider this as part of the overall assessment</li>
        </ul>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

        <p style="margin: 0; color: #999; font-size: 12px; text-align: center;">
            This is an automated security alert from the Intern Training System.
        </p>
    </div>
</div>
