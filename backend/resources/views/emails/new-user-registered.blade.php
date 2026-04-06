<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>New User Registration</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f1f5f9;
            padding: 2rem 1rem;
            color: #1e293b;
        }
        .wrapper {
            max-width: 560px;
            margin: 0 auto;
        }
        .card {
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }
        /* Header gradient */
        .header {
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            padding: 2rem 2rem 1.5rem;
            text-align: center;
        }
        .header .logo {
            font-size: 1.6rem;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.5px;
            margin-bottom: 0.25rem;
        }
        .header .subtitle {
            font-size: 0.85rem;
            color: rgba(255,255,255,0.75);
        }
        /* Alert bar */
        .alert-bar {
            background: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 0.75rem 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #92400E;
        }
        /* Body */
        .body {
            padding: 2rem;
        }
        .body p {
            color: #475569;
            font-size: 0.9375rem;
            line-height: 1.7;
            margin-bottom: 1.5rem;
        }
        /* User profile card */
        .profile {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1.25rem 1.5rem;
            margin-bottom: 1.75rem;
        }
        .profile-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e2e8f0;
        }
        .avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 1.25rem;
            font-weight: 800;
            flex-shrink: 0;
        }
        .profile-name {
            font-size: 1.0625rem;
            font-weight: 700;
            color: #0f172a;
        }
        .profile-email {
            font-size: 0.8125rem;
            color: #64748b;
            margin-top: 0.1rem;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.4rem 0;
        }
        .detail-row:not(:last-child) {
            border-bottom: 1px solid #f1f5f9;
        }
        .detail-label {
            font-size: 0.8125rem;
            color: #94a3b8;
            font-weight: 500;
        }
        .detail-value {
            font-size: 0.875rem;
            color: #1e293b;
            font-weight: 600;
        }
        .badge {
            display: inline-block;
            padding: 0.2rem 0.65rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: capitalize;
        }
        .badge-pending  { background: #FEF3C7; color: #92400E; }
        .badge-intern   { background: #EEF2FF; color: #4338CA; }
        .badge-teamlead { background: #F3E8FF; color: #6D28D9; }
        /* CTA button */
        .cta-wrap {
            text-align: center;
            margin-bottom: 1.5rem;
        }
        .cta-btn {
            display: inline-block;
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            color: #ffffff !important;
            text-decoration: none;
            padding: 0.875rem 2.5rem;
            border-radius: 10px;
            font-size: 0.9375rem;
            font-weight: 700;
            letter-spacing: 0.01em;
            box-shadow: 0 4px 14px rgba(79,70,229,0.35);
        }
        /* Pending count */
        .pending-notice {
            background: #EEF2FF;
            border-radius: 10px;
            padding: 1rem 1.25rem;
            text-align: center;
            margin-bottom: 1.75rem;
        }
        .pending-notice .count {
            font-size: 2rem;
            font-weight: 800;
            color: #4F46E5;
            display: block;
            line-height: 1;
        }
        .pending-notice .count-label {
            font-size: 0.8125rem;
            color: #6366f1;
            margin-top: 0.25rem;
        }
        /* Footer */
        .footer {
            border-top: 1px solid #e2e8f0;
            padding: 1.25rem 2rem;
            text-align: center;
            background: #f8fafc;
        }
        .footer p {
            font-size: 0.8rem;
            color: #94a3b8;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">

            <!-- Header -->
            <div class="header">
                <div class="logo">InternPro</div>
                <div class="subtitle">Internship Performance Management System</div>
            </div>

            <!-- Alert bar -->
            <div class="alert-bar">
                ⚠️ &nbsp;Action Required: New Registration Pending Approval
            </div>

            <!-- Body -->
            <div class="body">
                <p>
                    A new user has registered on the InternPro platform and is awaiting your review.
                    Please log in to the HR portal to approve or reject their account.
                </p>

                <!-- User profile card -->
                <div class="profile">
                    <div class="profile-header">
                        <div class="avatar">{{ strtoupper(substr($newUser->name, 0, 1)) }}</div>
                        <div>
                            <div class="profile-name">{{ $newUser->name }}</div>
                            <div class="profile-email">{{ $newUser->email }}</div>
                        </div>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Role</span>
                        <span class="badge {{ $newUser->role?->name === 'intern' ? 'badge-intern' : 'badge-teamlead' }}">
                            {{ ucfirst($newUser->role?->name ?? 'Unknown') }}
                        </span>
                    </div>
                    @if($newUser->technology)
                    <div class="detail-row">
                        <span class="detail-label">Technology</span>
                        <span class="detail-value">{{ $newUser->technology->name }}</span>
                    </div>
                    @endif
                    <div class="detail-row">
                        <span class="detail-label">Status</span>
                        <span class="badge badge-pending">Pending</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Registered</span>
                        <span class="detail-value">{{ $newUser->created_at->format('d M Y, h:i A') }}</span>
                    </div>
                </div>

                <!-- Pending count -->
                <div class="pending-notice">
                    <span class="count">{{ $pendingCount }}</span>
                    <div class="count-label">Total account{{ $pendingCount != 1 ? 's' : '' }} currently pending approval</div>
                </div>

                <!-- CTA button -->
                <div class="cta-wrap">
                    <a href="{{ config('app.url') }}/hr/approvals" class="cta-btn">
                        Review Now →
                    </a>
                </div>

                <p style="font-size:0.8375rem; color:#94a3b8; text-align:center; margin-bottom:0;">
                    This is an automated notification from InternPro. Do not reply to this email.
                </p>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>
                    © {{ date('Y') }} InternPro &nbsp;·&nbsp; Internship Performance Management<br>
                    You're receiving this because you're an HR manager on this platform.
                </p>
            </div>

        </div>
    </div>
</body>
</html>
