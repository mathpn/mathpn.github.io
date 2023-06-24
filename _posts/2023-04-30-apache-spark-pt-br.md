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

Adicione a seguinte linha ao arquivo etc/hadoop/hadoop-env.sh

```bash
export HADOOP_CONF_DIR=/home/matheus/hadoop/etc/hadoop
```

## Adicionando permissões ao firewall

É necessário adicionar permissões ao firewall tanto da sua máquina quanto do servidor. Os comandos abaixo funcionam em Arch Linux com o pacote firewall-cmd.


sudo firewall-cmd --add-source=192.168.15.25 --zone=trusted
(local) sudo firewall-cmd --add-source=192.168.15.18 --zone=trusted

sudo chmod +777 -R /home/matheus/hadoop/logs/


## Formatando o sistema de arquivos Hadoop

Mais informações [aqui](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/SingleCluster.html).

```bash
bin/hdfs namenode -format
sbin/start-dfs.sh
bin/hdfs dfs -mkdir /user
bin/hdfs dfs -mkdir /user/matheus
```

nvim etc/hadoop/mapred-site.xml
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


nvim etc/hadoop/yarn-site.xml
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

http://192.168.15.18:9870/
http://192.168.15.18:8088/


## Instalando spark

wget https://dlcdn.apache.org/spark/spark-3.3.2/spark-3.3.2-bin-hadoop3.tgz
tar -xzf spark-3.3.2-bin-hadoop3.tgz

nvim ~/.bashrc
export SPARK_HOME=/home/matheus/spark
export PATH=$PATH:$SPARK_HOME/bin:$SPARK_HOME/sbin

source ~/.bashrc

nvim conf/spark-env.sh.template
SPARK_MASTER_HOST=192.168.15.18
mv conf/spark-env.sh.template conf/spark-env.sh

cd bin
start-master.sh
start-worker.sh spark://192.168.15.18:7077
checar http://192.168.15.18:8080/ - tem que ter worker

stop-worker.sh
stop-master.sh

sudo nvim /etc/systemd/system/spark-master.service
```
[Unit]
Description=Apache Spark Master
After=network.target

[Service]
Type=forking
User=root
Group=root
ExecStart=/home/matheus/spark/sbin/start-master.sh
ExecStop=/home/matheus/spark/sbin/stop-master.sh

[Install]
WantedBy=multi-user.target
```

sudo nvim /etc/systemd/system/spark-worker.service
```
[Unit]

Description=Apache Spark Worker

After=network.target

[Service]
Type=forking
User=root
Group=root
ExecStart=/home/matheus/spark/sbin/start-worker.sh spark://192.168.15.18:7077
ExecStop=/home/matheus/spark/sbin/stop-worker.sh

[Install]
WantedBy=multi-user.target
```

sudo systemctl start spark-master spark-worker
checar browser

sudo systemctl stop spark-master spark-worker
nvim conf/spark-env.sh
HADOOP_CONF_DIR=/home/matheus/hadoop/etc/hadoop

sudo systemctl start spark-master spark-worker
checar browser

sudo systemctl enable spark-master spark-worker

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder \
    .appName("DeltaLakeExample") \
    .master("spark://192.168.15.18:7077") \
    .config("spark.jars.packages", "io.delta:delta-core_2.12:2.3.0") \
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension") \
    .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog") \
    .getOrCreate()

# Create a sample dataframe
data = [("Alice", 1), ("Bob", 2), ("Charlie", 3)]
df = spark.createDataFrame(data, ["Name", "Age"])

# Write the dataframe to Delta Lake
df.write.format("delta").mode("overwrite").option("path", "hdfs://192.168.15.18:9000/tables/foobar").saveAsTable("foobar")
```
