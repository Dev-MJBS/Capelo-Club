-- 1. PRIMEIRO: Adicionar coluna is_founder se não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT FALSE;

-- 2. SEGUNDO: Marcar os 24 membros fundadores
UPDATE public.profiles
SET is_founder = true
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email IN (
        'helgarkulfseks@gmail.com',
        'ronildop123@gmail.com',
        'jarina.rina.rina@gmail.com',
        'morethsonn@gmail.com',
        'mjbs.dev@gmail.com',
        'mateusjob.brito@gmail.com',
        'clarissa7999@gmail.com',
        'acaiahfilmes@gmail.com',
        'adm.aliceoliveira@gmail.com',
        'henriquetostadias@gmail.com',
        'guilherme95199@gmail.com',
        'isabmarquetti@gmail.com',
        'pedrxxxleaop@gmail.com',
        'ju.spinelli@gmail.com',
        'luciano.robaski@gmail.com',
        'carolinahallal@usp.br',
        'juliiaalves543@gmail.com',
        'victoriamp456@gmail.com',
        'cassiosarapiao44@gmail.com',
        'pr3ttyeli@gmail.com',
        'carolgirasol334457@gmail.com',
        'macielpamplonaa@gmail.com',
        'raquelsilveira180506@gmail.com',
        'mjobbrito@gmail.com'
    )
);
