# Clínica Presença

Sistema de controle de presenças e faltas para clínica.

- Frontend: HTML/CSS/JavaScript estático
- Banco e autenticação: Supabase
- Segurança: PostgreSQL RLS, autenticação, auditoria e headers HTTP
- Hospedagem prevista: Render Static Site

O frontend usa apenas a chave pública do Supabase. A chave `service_role` nunca deve ser publicada.
