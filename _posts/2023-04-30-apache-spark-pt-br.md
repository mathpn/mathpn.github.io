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


## Roteador

Agora vamos fixar um IP para nosso servidor no roteador. Isso é importante para que o servidor sempre se conecte utilizando o mesmo IP local, o que facilita a conexão utilizando SSH.

Utilize o seguinte comando e anote o IP que aparece no campo "gateway":

```bash
ip -json route get 8.8.8.8
```

Agora, vá até esse IP, faça log-in no seu roteador (cada marca possui um par de usuário e senha padrão, verifique no seu roteador). Infelizmente, como há muitas marcas disponíveis, essa etapa vai variar bastante. Mas, em linhas gerais, basta ir na seção de rede local, localizar o seu servidor pelo IP e adicionar uma nova reserva de IP para aquele dispositivo.


## Instalando Hadoop

Agora vamos instalar o Hadoop no servidor. É necessário instalar também o Java Runtime Environment versão 11. Nesse ponto, você deve ser capaz de conectar-se facilmente ao servidor utilizando o SSH. Conectado ao servidor, rode os seguintes comandos:

```bash
sudo pacman -S jre11-openjdk
wget https://dlcdn.apache.org/hadoop/common/hadoop-3.3.5/hadoop-3.3.5.tar.gz
tar -xzf hadoop-3.3.5.tar.gz
mv hadoop-3.3.5 ~/hadoop
cd ~/hadoop
```

Adicione as seguintes linhas ao arquivo etc/hadoop/hadoop-env.sh:

```
export JAVA_HOME=/lib/jvm/default
```

Em seguida:

```bash
source etc/hadoop/hadoop-env.sh 
```
bin/hadoop ????

Adicione as seguinte linhas ao arquivo etc/hadoop/core-site.xml

```
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://localhost:9000</value>
    </property>
</configuration>
```

Adicione as seguinte linhas ao arquivo etc/hadoop/hdfs-site.xml

```
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>1</value>
    </property>
    <property>
        <name>dfs.data.dir</name>
	<value>/home/matheus/hadoop_data</value>
    </property>
</configuration>
```

Agora precisamos checar se conseguimos conectar-se ao localhost. Provavelmente o comando a seguir irá resultar em um erro:

```bash
ssh localhost
```

*Atenção: rode esse comando conectado ao servidor!*

Caso o comando resulte em um erro (o que é bem provável) rode os comandos a seguir:

```bash
ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 0600 ~/.ssh/authorized_keys
```

Agora tente conectar-se novamente ao localhost e dessa vez o comando deve funcionar!

```bash
ssh localhost
```
