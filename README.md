# ShepherdAI - AI-Powered Church Management

ShepherdAI is an AI-powered assistant designed specifically for small church pastors (50-300 members) to automate visitor follow-up and weekly newsletter creation.

## Features

### 1. Visitor Follow-up Agent
- Enter new visitor information
- AI generates a personalized 6-week email sequence
- Review, edit, and send with one click
- Warm, welcoming emails that encourage return visits

### 2. Weekly Newsletter Agent
- Input weekly highlights (sermon, events, prayer requests)
- AI creates professional, formatted newsletters
- Edit and customize before sending
- One-click distribution to your subscriber list

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (free tier)
- **AI**: OpenAI GPT-4o-mini
- **Email**: Resend API
- **Payment**: Lemon Squeezy (coming soon)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free)
- OpenAI API key
- Resend API key (for email sending)

### Installation

1. Navigate to the project directory:
```bash
cd shepherdai
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Fill in your API keys in `.env.local`:
```env
# Supabase (get from https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-openai-key

# Resend (get from https://resend.com/api-keys)
RESEND_API_KEY=re-your-resend-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Set up Supabase Database:

Go to your Supabase project SQL Editor and run:

```sql
-- Create church_settings table
CREATE TABLE IF NOT EXISTS public.church_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  church_name TEXT NOT NULL DEFAULT '',
  pastor_name TEXT NOT NULL DEFAULT '',
  email_signature TEXT DEFAULT '',
  website TEXT DEFAULT '',
  address TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.church_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own settings
CREATE POLICY "Users can view own settings" ON public.church_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.church_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.church_settings
  FOR UPDATE USING (auth.uid() = user_id);
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
shepherdai/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   └── generate/
│   │   ├── dashboard/        # Dashboard page
│   │   ├── login/            # Login page
│   │   ├── register/         # Register page
│   │   ├── settings/         # Settings page
│   │   ├── visitor-followup/ # Visitor follow-up agent
│   │   ├── weekly-newsletter/ # Newsletter generator
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Landing page
│   │   └── globals.css
│   ├── lib/
│   │   ├── auth.ts           # Auth utilities
│   │   └── openai.ts         # OpenAI utilities
│   └── types/
├── .env.local
├── package.json
└── README.md
```

## Usage

### Visitor Follow-up

1. Log in to your dashboard
2. Click "Visitor Follow-up Agent"
3. Enter the visitor's name, email, and visit date
4. Optionally add how they heard about you and their interests
5. Click "Generate Email Sequence"
6. Review and edit the generated emails
7. Click "Send All Emails" to send the sequence

### Weekly Newsletter

1. Log in to your dashboard
2. Click "Weekly Newsletter Agent"
3. Enter the week's date and any highlights
4. Click "Generate Newsletter"
5. Review and edit the content
6. Click "Send Newsletter" to distribute

## Configuration Notes

### Supabase Setup
- Create a new project at [supabase.com](https://supabase.com)
- Go to Settings > API to get your URL and anon key
- Run the SQL above in the SQL Editor to create the required tables

### OpenAI Setup
- Create an account at [platform.openai.com](https://platform.openai.com)
- Go to API Keys and create a new key
- Add credits to your account for API usage

### Resend Setup
- Create an account at [resend.com](https://resend.com)
- Create an API key
- Verify a domain or use their test mode

## Pricing Plans

| Feature | Free | Pro ($19/mo) | Church ($99/mo) |
|---------|------|--------------|-----------------|
| AI Generations | 10/month | 100/month | Unlimited |
| Visitor Follow-up | ✓ | ✓ | ✓ |
| Newsletter Generator | ✓ | ✓ | ✓ |
| Email Editing | ✓ | ✓ | ✓ |
| Priority Support | - | ✓ | ✓ |
| Team Members | 1 | 1 | 5 |
| Bulk Sending | - | - | ✓ |

## Development

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## License

MIT License

---

Built with ❤️ for church pastors
