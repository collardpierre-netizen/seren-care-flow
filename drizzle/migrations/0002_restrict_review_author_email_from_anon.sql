-- Public review listings must not be able to harvest reviewer email addresses.
REVOKE SELECT (author_email) ON public.product_reviews FROM anon;