# Roadmap — Acesso Remoto ao Claude Code (Plano Pro)

**Data:** 2026-03-02
**Contexto:** Claude Code Remote Control exige plano Max. Alternativa: Tailscale + SSH + tmux.
**Objetivo:** Acessar a sessão Claude Code (rodando no PC local com Tessy) a partir de outro dispositivo (celular, tablet, notebook) sem upgrade de plano.

---

## Arquitetura da Solução

```
[Celular / Tablet / Outro PC]
         │
         │  SSH sobre rede Tailscale (cifrado, sem abrir portas)
         ▼
[PC Local — Windows 11]
   └── Tailscale daemon (VPN mesh)
   └── OpenSSH Server (Windows opcional, ou WSL)
   └── tmux session "tessy"
         └── claude (Claude Code CLI)
               └── Tessy (npm start — porta 3000 + 3002)
```

---

## Fases

### Fase 1 — Tailscale (VPN mesh gratuita)
**Meta:** Dois dispositivos acessíveis pelo mesmo IP privado, sem precisar de IP fixo ou abrir portas no roteador.

**Passos:**
1. Criar conta em https://tailscale.com (gratuito até 3 dispositivos)
2. Instalar Tailscale no PC local (Windows):
   - Baixar em https://tailscale.com/download/windows
   - Executar e autenticar com a conta criada
3. Instalar Tailscale no dispositivo remoto (Android/iOS/outro PC):
   - Mesma conta → ambos aparecem na mesma "tailnet"
4. Verificar conectividade:
   ```bash
   tailscale status
   # Anote o IP Tailscale do PC local (ex: 100.x.x.x)
   ping 100.x.x.x
   ```

**Resultado esperado:** Ping funcionando entre os dois dispositivos.

---

### Fase 2 — SSH Server no Windows
**Meta:** Acessar o terminal do PC local via SSH a partir do dispositivo remoto.

**Passos:**
1. Ativar OpenSSH Server (nativo no Windows 11):
   ```powershell
   # PowerShell como Administrador
   Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
   Start-Service sshd
   Set-Service -Name sshd -StartupType 'Automatic'
   ```
2. Verificar que o firewall não bloqueia porta 22 (o Tailscale bypassa o firewall público, mas o Windows Firewall pode bloquear internamente):
   ```powershell
   New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
   ```
3. Testar SSH do próprio PC:
   ```bash
   ssh localhost
   ```
4. Testar SSH do dispositivo remoto via IP Tailscale:
   ```bash
   ssh usuario@100.x.x.x
   ```

**Resultado esperado:** Shell do PC local acessível remotamente.

---

### Fase 3 — tmux (sessão persistente)
**Meta:** Manter Claude Code rodando mesmo após desconectar o SSH.

**Passos:**
1. Instalar tmux (via Scoop ou WSL — recomendado WSL 2):
   ```bash
   # Via Scoop (Windows nativo)
   scoop install tmux

   # Ou via WSL2 (Ubuntu)
   sudo apt install tmux
   ```
2. Criar sessão nomeada para Tessy:
   ```bash
   tmux new -s tessy
   ```
3. Dentro da sessão tmux, iniciar Claude Code:
   ```bash
   cd /mnt/c/Rabelus_Lab/Tessy/tessy_legacy  # se WSL
   # ou
   cd C:/Rabelus_Lab/Tessy/tessy_legacy       # se PowerShell nativo
   claude
   ```
4. Desanexar sem matar: `Ctrl+B`, depois `D`
5. Para reanexar de qualquer dispositivo:
   ```bash
   tmux attach -t tessy
   ```

**Resultado esperado:** Sessão Claude Code persiste mesmo após fechar o SSH.

---

### Fase 4 — Acesso à UI do Tessy (opcional)
**Meta:** Acessar a interface web do Tessy (porta 3000) no navegador do dispositivo remoto.

**Passos:**
1. Garantir que `npm start` está rodando dentro da sessão tmux (porta 3000 + 3002)
2. No dispositivo remoto, abrir o navegador com o IP Tailscale:
   ```
   http://100.x.x.x:3000
   ```
3. Se o Vite bloquear (CORS/host check), editar `vite.config.ts`:
   ```typescript
   server: {
     host: '0.0.0.0',  // aceita conexões externas
     port: 3000
   }
   ```

**Resultado esperado:** Interface Tessy acessível no celular/tablet.

---

## Checklist de Conclusão

- [ ] Fase 1: Tailscale instalado e ambos os dispositivos visíveis na tailnet
- [ ] Fase 2: SSH funcionando via IP Tailscale
- [ ] Fase 3: tmux com sessão "tessy" persistente
- [ ] Fase 4: UI do Tessy acessível no dispositivo remoto (opcional)
- [ ] Documentar IP Tailscale do PC local em local seguro

---

## Referências

- Tailscale: https://tailscale.com/docs
- OpenSSH no Windows: https://learn.microsoft.com/windows-server/administration/openssh/openssh_install_firstuse
- tmux cheatsheet: https://tmuxcheatsheet.com
- Claude Code Remote Control (futuro — plano Max): https://code.claude.com/docs/en/remote-control.md
