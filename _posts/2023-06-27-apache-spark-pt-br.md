---
title: "Como configurar e usar um cluster de Apache Spark em sua rede local"
header:
  overlay_image: /assets/images/default_overlay.jpg
  show_overlay_excerpt: false
categories:
  - Tutorial
tags:
  - Python
  - Data Science
excerpt: "Tutorial de como transformar seu computador antigo em um servidor com Apache Spark e Apache Hadoop"
---

# Introdução

Digamos que você tenha um computador antigo acumulando poeira na sua casa. Que tal transformá-lo em seu próprio servidor com Apache Spark? Decidi fazer isso com meu computador antigo e vou descrever abaixo todos os passos para instalar e configurar o Apache Spark para utilização em sua rede local.

Estou usando o [Linux Manjaro](https://manjaro.org/download/) mais recente, o qual é baseado em [Arch Linux](https://archlinux.org/). Portanto, outras distribuições baseadas em Arch (provavelmente) podem utilizar os mesmos passos sem nenhuma alteração. É possível adaptar os passos para outras distribuições Linux.

# O que é Apache Spark?

O Apache Spark é um framework de processamento de dados distribuído e escalável, projetado para lidar com grandes volumes de dados. Geralmente o Spark opera em _cluster_, isto é, vários servidores conectados os quais processam as requisições de forma distribuída, elevando a ordem de magnitude da velocidade e da quantidade de dados que podem ser processados. Aqui, no entanto, configuraremos um [_standalone cluster_](https://spark.apache.org/docs/latest/spark-standalone.html), isto é, um _cluster_ com apenas um servidor. O Spark é utilizado em diversos cenários, desde processamento de grandes quantidades de dados até aprendizado de máquina, e é uma ferramente importante para quem trabalha na área de dados. Além disso, ele permite a execução escalável de queries SQL.

O Spark oferece suporte a diferentes linguagens, como Scala, Python e R. Ao final do post, faremos uma conexão utilizando o [_pyspark_](https://spark.apache.org/docs/latest/api/python/index.html), API do Spark para Python.


# Configurando o servidor

A partir de agora, já chamaremos o seu computador velho de servidor! Primeiro, vamos configurar algumas coisas.

## SSH

Primeiro, conecte um mouse, teclado e tela ao seu computador antigo. Vamos instalar e configurar o OpenSSH. Isso permitirá a conexão remota ao servidor (vamos chamar de servidor daqui em diante). Também recomendo instalar um editor de texto adequado ao terminal. Aqui utilizo o neovim, mas sinta-se à vontade para utilizar qualquer um, inclusive o nano (que já deve estar instalado). E se ficar preso dentro do vim/neovim, basta utilizar o comando :q para sair (Ctrl+C para sair do modo de inserção e digitar comandos).

```bash
sudo pacman -S openssh
sudo pacman -S neovim
```

Agora vamos gerar chaves SSH para o servidor e habilitar o serviço do servidor SSH.

```bash
sudo systemctl enable sshd.service
sudo systemctl start sshd.service
```

Agora vamos instalar o jq e utilizá-lo para obter o IP local da máquina:

```bash
sudo pacman -S jq
ip -json route get 8.8.8.8 | jq -r '.[].prefsrc'
```

Anote esse endereço IP, ele será utilizado em diversos momentos. **Sempre que houver \<IP\> em um comando, substitua pelo endereço IP do seu servidor, a menos que especifique outra coisa**. Em outro computador, tente conectar-se ao servidor utilizando usuário e senha por meio do ssh:

```bash
ssh <IP>
```

Se conseguiu se conectar, está tudo certo. Agora, ainda na sua máquina principal, vamos gerar uma chave SSH para conectar-se ao servidor. É recomendável que essa chave seja usada exclusivamente para esse fim. Nos locais onde coloco <nome_do_arquivo>, substitua pelo caminho completo até o nome do arquivo da chave privada. Sugiro salvá-la na pasta ~/.ssh.

```bash
ssh-keygen -t ed25519 -C "<nome_da_chave>"
ssh-add ~/.ssh/<nome_do_arquivo>
```

Copie todo o conteúdo da chave _pública_ que geramos (arquivo .pub), conecte-se novamente o servidor e adicione todo o conteúdo copiado ao arquivo ~/.ssh/authorized_keys

```bash
cat ~/.ssh/<nome_do_arquivo>.pub

ssh <IP>
mkdir ~/.ssh
nvim ~/.ssh/authorized_keys
```

Desconecte-se do servidor e tente conectar-se novamente. Dessa vez, o login deve acontecer sem senha, por meio da sua chave SSH. Vamos então desabilitar a conexão remota utilizando senha por motivos de segurança. Novamente, conectado ao servidor pelo terminal:

```bash
sudo nvim /etc/ssh/sshd_config
```

Adicione as seguintes linhas:

```
PasswordAuthentication no
AuthenticationMethods publickey
```

Desconecte-se do servidor. Vamos editar o arquivo config do SSH para atribuir um nome ao IP do seu servidor. Adicione as seguintes linhas ao arquivo ~/.ssh/config (pode ser necessário criar o arquivo) da sua máquina local, substituindo os campos indicados:

```
Host <nome_do_servidor>
    HostName <IP>
    User <seu_usuário_no_servidor>
```


## Roteador

Agora vamos fixar um IP para nosso servidor no roteador. Isso é importante para que o servidor sempre se conecte utilizando o mesmo IP local, o que facilita a conexão utilizando SSH.

Utilize o seguinte comando e anote o IP que aparece no campo "gateway":

```bash
ip -json route get 8.8.8.8
```

Agora, vá até esse IP no navegador, faça log-in no seu roteador (cada marca possui um par de usuário e senha padrão, verifique no seu roteador). Infelizmente, como há muitas marcas disponíveis, essa etapa varia bastante. Mas, em linhas gerais, basta ir na seção de rede local, localizar o seu servidor pelo IP e adicionar uma nova reserva de IP para aquele dispositivo.


# Apache Hadoop

O Apache Spark pode rodar sem o Apache Hadoop, no entanto algumas funcionalidades dependem do Hadoop, por isso ele será instalado e configurado primeiro. O Apache Hadoop é um framwork também para processamento paralelo e escalável de grande quantidades dados. Um dos seus principais componentes é o _Hadoop Distributed File System (HDFS)_, um sistema de arquivos distribuído que distribui e replica os dados em diferentes nós do cluster. O Apache Spark utiliza o HDFS para gerenciar o armazenamento de arquivos de forma distribuída, bem como o YARN (outro componente do Hadoop) para alocação de recursos do _cluster_.

## Instalando o Apache Hadoop

É necessário instalar o Java Runtime Environment versão 11. Nesse ponto, você deve ser capaz de conectar-se facilmente ao servidor utilizando o SSH. Conectado ao servidor, rode os seguintes comandos:

```bash
sudo pacman -S jre11-openjdk
wget https://dlcdn.apache.org/hadoop/common/hadoop-3.3.5/hadoop-3.3.5.tar.gz
tar -xzf hadoop-3.3.5.tar.gz
mv hadoop-3.3.5 ~/hadoop
cd ~/hadoop
```

Adicione as seguintes linhas ao arquivo _etc/hadoop/hadoop-env.sh_:

```
export JAVA_HOME=/lib/jvm/default
```

**Atenção: o diretório JAVA_HOME varia conforme sua distribuição Linux. Ele deve conter o caminho até a implementação Java a ser utilizada pelo Hadoop.**

Em seguida:

```bash
source etc/hadoop/hadoop-env.sh
```

Adicione as seguinte linhas ao arquivo _etc/hadoop/core-site.xml_, substituindo a tag **\<configuration\>** vazia.

```xml
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://localhost:9000</value>
    </property>
</configuration>
```

Adicione as seguinte linhas ao arquivo _etc/hadoop/hdfs-site.xml_, **substituindo a tag \<HOME\> pelo caminho completo até sua pasta home** (algo como /home/\<nome_do_usuario\>).

```xml
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>1</value>
    </property>
    <property>
        <name>dfs.data.dir</name>
	<value><HOME>/hadoop_data</value>
    </property>
</configuration>
```

Note que configuramos um fator de replicação de 1. Em ambientes de produção, isso não é recomendado uma vez que pode acarretar em perda de dados em caso de falha do _hardware_. Como estamos em um ambiente local, utilizamos 1 para economizar recursos da máquina.

Agora precisamos checar se conseguimos conectar-se ao localhost **sem exigir senha**. Provavelmente o comando a seguir irá resultar em um erro ou exigir senha:

```bash
ssh localhost
```

*Atenção: rode esse comando conectado ao servidor pelo terminal via SSH!*

Caso o comando resulte em um erro ou peça senha - o que é bem provável - rode os comandos a seguir:

```bash
ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 0600 ~/.ssh/authorized_keys
```

Agora tente conectar-se novamente ao localhost e dessa vez o comando deve funcionar!

```bash
ssh localhost
```

Adicione a seguinte linha ao arquivo _etc/hadoop/hadoop-env.sh_

```bash
export HADOOP_CONF_DIR=$HOME/etc/hadoop
```

## Adicionando permissões ao firewall (opcional)

Dependendo da sua distribuição linux, pode ser necessário adicionar permissões ao firewall tanto da sua máquina quanto do servidor. Os comandos abaixo funcionam em Arch Linux com o pacote firewalld. Basicamente, permitimos conexão por todas as portas entre o servidor e a nossa máquina. Isso pode trazer riscos de segurança se você não puder confiar na segurança da sua rede local ou no seu servidor. Rode o mesmo comando tanto no servidor quanto na sua máquina. No servidor, insira o IP da sua máquina no lugar de \<IP\> e vice-versa. Se necessário, instale firewalld de acordo com as instruções da sua distribuição, há mais informações [aqui](https://wiki.archlinux.org/title/firewalld).

Você pode pular essa etapa. Caso não consiga abrir URLs que apontem para o servidor posteriormente, volte para esse ponto e adicione permissões de firewall de acordo com as intruções da sua distribuição Linux.

```bash
sudo firewall-cmd --add-source=<IP> --zone=trusted
```

## Formatando o sistema de arquivos Hadoop

Mais informações [aqui](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/SingleCluster.html). Substitua **\<USERNAME\>** pelo seu nome de usuário do sistema.

```bash
bin/hdfs namenode -format
sbin/start-dfs.sh
bin/hdfs dfs -mkdir /user
bin/hdfs dfs -mkdir /user/<USERNAME>
```

## Mais configurações do Hadoop

Adicione às seguintes linhas ao arquivo _etc/hadoop/mapred-site.xml_ no lugar da tag **\<configuration\>** vazia.

```xml
<configuration>
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
    <property>
        <name>mapreduce.application.classpath</name>
        <value>$HADOOP_MAPRED_HOME/share/hadoop/mapreduce/*:$HADOOP_MAPRED_HOME/share/hadoop/mapreduce/lib/*</value>
    </property>
</configuration>
```


Adicione as seguintes linhas ao arquivo etc/hadoop/yarn-site.xml no lugar da tag **\<configuration\>** vazia.

```xml
<configuration>
    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>
    <property>
        <name>yarn.nodemanager.env-whitelist</name>
        <value>JAVA_HOME,HADOOP_COMMON_HOME,HADOOP_HDFS_HOME,HADOOP_CONF_DIR,CLASSPATH_PREPEND_DISTCACHE,HADOOP_YARN_HOME,HADOOP_HOME,PATH,LANG,TZ,HADOOP_MAPRED_HOME</value>
    </property>
</configuration>
```

## Verificar se o Hadoop está rodando

Nesse ponto, o Apache Hadoop deve estar rodando no seu servidor! Verifique se consegue acessar o seguinte endereço no navegador da sua máquina principal

> http://\<IP\>:9870/

No qual **\<IP\>** é o endereço IP local do seu servidor. Caso veja uma página com informações do Hadoop, verifique o campo **DFS Remaining** - deve haver pelo menos alguma memória livre. Caso a configuração do Hadoop tenha algum problema, é possível que não haja nenhum espaço livre detectado.


# Apache Spark

## Instalando o Spark

```bash
wget https://dlcdn.apache.org/spark/spark-3.4.1/spark-3.4.1-bin-hadoop3.tgz
tar -xzf spark-3.4.1-bin-hadoop3.tgz
mv spark-3.4.1-bin-hadoop3 ~/spark
```

## Configurando o Spark

Dependendo do seu shell, adicionaremos linhas a arquivos diferentes. Este arquivo é ~/.bashrc caso use Bash e ~/.zshrc caso use zsh. Verifique qual Shell está em uso com o comando:

```bash
ps -p $$
```

Na coluna CMD estará o nome do Shell em uso.

Adicione as seguintes linhas:

```bash
export SPARK_HOME=$HOME/spark
export PATH=$PATH:$SPARK_HOME/bin:$SPARK_HOME/sbin
```

Rode o seguinte comando para as novas linhas terem efeito na sessão atual do Shell (aqui assumindo que bash está em uso):

```bash
source ~/.bashrc
```

Vá até a pasta ~/spark. Adicione as seguintes linhas ao arquivo _conf/spark-env.sh.template_ na qual **\<IP\> é o IP local do seu servidor.

```bash
SPARK_MASTER_HOST=<IP>
HADOOP_CONF_DIR=$HOME/hadoop/etc/hadoop
```

Vamos renomear o arquivo:

```bash
mv conf/spark-env.sh.template conf/spark-env.sh
```

## Iniciando uma sessão do Spark

Substitua **\<IP\>** pelo IP local do seu servidor.

```bash
cd bin
start-master.sh
start-worker.sh spark://<IP>:7077
```

Na sua máquina principal, vá até o endereço http://\<IP\>:8080/ (novamente, substitua a tag IP conforme dito acima). Uma página com o título "Spark Master" deve carregar. Verifique na sessão _"Workers"_ se há um _worker_ rodando. Se sim, o Spark está rodando normalmente. Vamos parar o Spark.

```bash
stop-worker.sh
stop-master.sh
```

## Criando um serviço para rodar o Spark automaticamente

Essa etapa é opcional. Com os comandos acima é possível iniciar seu servidor Spark sempre que necessário. Aqui vamos integrar o Spark ao systemd para poder gerenciá-lo como um serviço rodando ao fundo do sistema sempre que ligamos o servidor.

Crie o arquivo _/etc/systemd/system/spark-master.service_ e adicione as seguintes linhas (necessário abrir o editor com sudo). **Lembre-se de substituir \<HOME\> pelo caminho completo até a pasta home do seu usuário!**

```
[Unit]
Description=Apache Spark Master
After=network.target

[Service]
Type=forking
User=root
Group=root
ExecStart=<HOME>/spark/sbin/start-master.sh
ExecStop=<HOME>/spark/sbin/stop-master.sh

[Install]
WantedBy=multi-user.target
```

Crie o arquivo _/etc/systemd/system/spark-worker.service_ e adicione as seguintes linhas (necessário abrir o editor com sudo). **Lembre-se de substituir \<IP\> pelo IP local do seu servidor e \<HOME\> pelo caminho completo até a pasta home do seu usuário!**

```
[Unit]

Description=Apache Spark Worker

After=network.target

[Service]
Type=forking
User=root
Group=root
ExecStart=<HOME>/spark/sbin/start-worker.sh spark://<IP>:7077
ExecStop=<HOME>/spark/sbin/stop-worker.sh

[Install]
WantedBy=multi-user.target
```

Vamos ativar ambos os serviços para que sejam iniciados junto com o sistema e iniciá-los:

```bash
sudo systemctl enable spark-master spark-worker
sudo systemctl start spark-master spark-worker
```

Espere alguns segundos e, novamente, verifique o endereço http://\<IP\>:8080/. Se a mesma página de antes carregar com 1 _worker_ ativo, o Spark está rodando normalmente.


## Conectando-se ao servidor Spark remotamente via PySpark

É necessário ter o pyspark instalado em sua máquinax local para conectar-se ao servidor Spark. Siga as instruções [do site oficial](https://spark.apache.org/docs/latest/api/python/getting_started/install.html) para instalar o pyspark. Note que é necessário instalar o Java JDK e configurar a variável de ambiente JAVA_HOME também na sua máquina local (como fizemos acima). Nesse caso, é possível definir a variável JAVA_HOME manualmente ou inseri-la no arquivo _~/.bashrc_

O código abaixo conecta-se ao servidor Spark (lembre-se de substituir a tag **\<IP\>**), cria e exibe um DataFrame.


```python
from pyspark.sql import SparkSession

spark = SparkSession.builder \
    .appName("SparkTest") \
    .master("spark://<IP>:7077") \
    .getOrCreate()

# Create a sample dataframe
data = [("Alice", 1), ("Bob", 2), ("Charlie", 3)]
df = spark.createDataFrame(data, ["Name", "Age"])

df.show()
```

Se tudo correr bem, o _DataFrame_ será exibido.

# Conclusões

Parabéns! Você instalou e configurou o Apache Spark! Há diversos serviços de _cloud_ que oferecem _clusters_ com Apache Spark ou até mesmo ambientes completos integrados ao Spark (como é o caso do [Databricks](https://www.databricks.com/)). No entanto, esses serviços são bastante caros, o que praticamente inviabiliza seu uso para aprender a utilizar o Apache Spark fora do ambiente corporativo. O objetivo desse _post_ é permitir que qualquer um com um computador sobrando possa rodar o Apache Spark e aprender a utilizá-lo sem pagar nada.

Há muitos tópicos sobre Apache Spark que esse _post_ não sobre, como por exemplo suas **muitas** [configurações](https://spark.apache.org/docs/latest/configuration.html). Podemos explorar mais assuntos em outros posts, por hora ficamos por aqui. A [documentação](https://spark.apache.org/docs/latest/api/python/index.html) do PySpark é uma boa fonte de conhecimento para começar a utilizar seu servidor Spark.
