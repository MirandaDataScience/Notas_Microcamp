require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- CONEXÃO COM SUPABASE ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- ROTA DE LOGIN ---
app.post('/login', async (req, res) => {
    try {
        const { usuario_cliente, senha_cliente } = req.body;

        const { data, error } = await supabase
            .from('login')
            .select('*')
            .eq('user', usuario_cliente)
            .single();

        if (error || !data) {
            console.log("❌ Usuário não encontrado:", usuario_cliente);
            return res.status(401).json({ message: 'Usuário não encontrado.' });
        }

        // Logs para Debug no seu terminal
        console.log("----------------------------");
        console.log(`Comparando Senhas para: ${usuario_cliente}`);
        console.log(`Banco: [${data.password}]`);
        console.log(`Digitada: [${senha_cliente}]`);

        if (data.password.toString().trim() === senha_cliente.toString().trim()) {
            console.log("✅ Login Sucesso!");
            return res.status(200).json({ 
                message: 'Sucesso', 
                id_aluno: data.id_aluno 
            });
        } else {
            console.log("❌ Senha Incorreta.");
            return res.status(401).json({ message: 'Senha incorreta.' });
        }
    } catch (err) {
        console.error("🔥 Erro Crítico no Servidor:", err);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

// --- ROTA DE CURSOS ---
app.get('/meus-cursos/:id_aluno', async (req, res) => {
    try {
        const { id_aluno } = req.params;

        const { data, error } = await supabase
            .from('matricula')
            .select(`
                turma!inner (
                    curso!inner (
                        nome
                    )
                )
            `)
            .eq('id_aluno', id_aluno);

        if (error) throw error;

        const cursos = data.map(item => item.turma.curso.nome);
        res.status(200).json(cursos);
    } catch (err) {
        console.error("🔥 Erro ao buscar cursos:", err);
        res.status(500).json({ message: 'Erro ao buscar cursos' });
    }
});

// --- INICIALIZAÇÃO ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor pronto na porta ${PORT}`);
    console.log(`Link: http://localhost:${PORT}\n`);
});