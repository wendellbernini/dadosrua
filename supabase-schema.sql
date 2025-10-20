-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'collector');
CREATE TYPE campaign_status AS ENUM ('active', 'finished');

-- Create users table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'collector' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create campaigns table
CREATE TABLE public.campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status campaign_status DEFAULT 'active' NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create campaign_participants table (many-to-many relationship)
CREATE TABLE public.campaign_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(campaign_id, user_id)
);

-- Create contacts table
CREATE TABLE public.contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    collector_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    neighborhood TEXT NOT NULL,
    first_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    demand TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create app_settings table
CREATE TABLE public.app_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    registration_open BOOLEAN DEFAULT true NOT NULL,
    default_campaign_end_time TIME DEFAULT '00:00:00' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert default app settings
INSERT INTO public.app_settings (registration_open, default_campaign_end_time) 
VALUES (true, '00:00:00');

-- Create indexes for better performance
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_created_by ON public.campaigns(created_by);
CREATE INDEX idx_campaign_participants_campaign_id ON public.campaign_participants(campaign_id);
CREATE INDEX idx_campaign_participants_user_id ON public.campaign_participants(user_id);
CREATE INDEX idx_contacts_campaign_id ON public.contacts(campaign_id);
CREATE INDEX idx_contacts_collector_id ON public.contacts(collector_id);
CREATE INDEX idx_contacts_neighborhood ON public.contacts(neighborhood);
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON public.contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at 
    BEFORE UPDATE ON public.app_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically finish campaigns
CREATE OR REPLACE FUNCTION finish_expired_campaigns()
RETURNS void AS $$
BEGIN
    UPDATE public.campaigns 
    SET status = 'finished' 
    WHERE status = 'active' 
    AND end_date <= NOW();
END;
$$ language 'plpgsql';

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'full_name',
        'collector'
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update user roles" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Campaigns table policies
CREATE POLICY "Anyone can view active campaigns" ON public.campaigns
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can view all campaigns" ON public.campaigns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage campaigns" ON public.campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Campaign participants table policies
CREATE POLICY "Users can view their own participations" ON public.campaign_participants
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join campaigns" ON public.campaign_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave campaigns" ON public.campaign_participants
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all participations" ON public.campaign_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Contacts table policies
CREATE POLICY "Users can view their own contacts" ON public.contacts
    FOR SELECT USING (auth.uid() = collector_id);

CREATE POLICY "Users can create contacts in their campaigns" ON public.contacts
    FOR INSERT WITH CHECK (
        auth.uid() = collector_id AND
        EXISTS (
            SELECT 1 FROM public.campaign_participants cp
            WHERE cp.campaign_id = contacts.campaign_id 
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own contacts in active campaigns" ON public.contacts
    FOR UPDATE USING (
        auth.uid() = collector_id AND
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = contacts.campaign_id 
            AND c.status = 'active'
        )
    );

CREATE POLICY "Users can delete their own contacts in active campaigns" ON public.contacts
    FOR DELETE USING (
        auth.uid() = collector_id AND
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = contacts.campaign_id 
            AND c.status = 'active'
        )
    );

CREATE POLICY "Admins can view all contacts" ON public.contacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all contacts" ON public.contacts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- App settings table policies
CREATE POLICY "Admins can view app settings" ON public.app_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update app settings" ON public.app_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
