-- Delete user data from public tables first
DELETE FROM public.profiles WHERE user_id = '1974d783-ffac-4591-a794-a74a7b191abc';
DELETE FROM public.user_roles WHERE user_id = '1974d783-ffac-4591-a794-a74a7b191abc';
DELETE FROM public.waivers WHERE user_id = '1974d783-ffac-4591-a794-a74a7b191abc';

-- Delete the auth user so they can re-register
DELETE FROM auth.users WHERE id = '1974d783-ffac-4591-a794-a74a7b191abc';