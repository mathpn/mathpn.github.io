---
title: "Como configurar e usar um cluster de Apache Spark em sua rede local"
header:
  overlay_image: //assets/images/default_overlay.jpg
  show_overlay_excerpt: false
categories:
  - Tutorial
tags:
  - Python
  - Data Science
excerpt: ""
---

Digamos que você tenha um computador antigo acumulando poeira na sua casa. Que tal transformá-lo em seu próprio servidor com Apache Spark? Decidi fazer isso com meu computador antigo e vou descrever abaixo todos os passos para instalar e configurar o Apache Spark para utilização em sua rede local.

Estou usando o Linux Manjaro mais recente (escrevo em 15/05/2023), o qual é baseado em Arch Linux. Portanto, outras distribuições baseadas em Arch (provavelmente) podem utilizar os mesmos passos sem nenhuma alteração. É possível adaptar os passos para outras distribuições Linux.

## SSH

Primeiro, conecte um mouse, teclado e tela ao seu computador antigo. Vamos instalar e configurar o OpenSSH. Isso permitirá a conexão remota ao servidor (vamos chamar de servidor daqui em diante). Também recomendo instalar um editor de texto adequado ao terminal. Aqui utilizo o neovim, mas sinta-se à vontade para utilizar qualquer um, inclusive o nano (que já deve estar instalado). E se ficar preso dentro do vim/neovim, basta utilizar o comando :q para sair (Ctrl+C para sair do modo de inserção e digitar comandos).

```bash
yay -S openssh
yay -S neovim
```

Agora vamos gerar chaves SSH para nossa máquina e habilitar o serviço do servidor SSH.

```bash
ssh-keygen -A
sudo systemctl enable sshd.service
sudo systemctl start sshd.service
```

Agora vamos instalar o jq e utilizá-lo para obter o IP local da máquina:

```bash
yay -S jq
ip -json route get 8.8.8.8 | jq -r '.[].prefsrc'
```

Em outro computador, tente conectar-se ao servidor utilizando usuário e senha por meio do ssh:

```bash
ssh <endereço_ip>
```

Se conseguiu se conectar, está tudo certo. Agora, ainda na sua máquina principal, vamos gerar uma chave SSH para conectar-se ao servidor. É recomendável que essa chave seja usada exclusivamente para esse fim. Nos locais onde coloco <nome_do_arquivo>, substitua pelo caminho completo até o nome do arquivo da chave privada. Sugiro salvá-la na pasta ~/.ssh.

```bash
ssh-keygen -t ed25519 -C "<nome_da_chave>"
ssh-add ~/.ssh/<nome_do_arquivo>
```

Copie todo o conteúdo da chave _pública_ que geramos, conecte-se novamente o servidor e adicione todo o conteúdo copiado ao arquivo ~/.ssh/authorized_keys

```bash
cat ~/.ssh/<nome_do_arquivo>.pub

ssh <endereço_ip>
mkdir ~/.ssh
nvim ~/.ssh/authorized_keys
```

Desconecte-se do servidor e tente conectar-se novamente. Dessa vez, o login deve acontecer sem senha, por meio da sua chave SSH. Vamos então desabilitar a conexão remota utilizando senha por motivos de segurança. Novamente, conectado ao servidor pelo terminal:

```bash
sudo nvim /etc/ssh/sshd_config
```

Adicione as seguintes linhas

```
PasswordAuthentication no
AuthenticationMethods publickey
```

Desconecte-se do servidor. Vamos editar o arquivo config do SSH para atribuir um nome ao IP do seu servidor. Adicione as seguintes linhas ao arquivo ~/.ssh/config (pode ser necessário criar o arquivo), substituindo os campos indicados:

```
Host <nome_do_servidor>
    HostName <endereço_ip>
    User <seu_usuário_no_servidor>
```
