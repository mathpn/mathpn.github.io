---
title: "Como criptografar seu computador com LUKS e TPM + senha"
tags:
  - Linux
  - Tutorial
  - Security
description: "Tutorial de como criptografar um disco com LUKS, TPM + senha no Linux"
pubDatetime: 2024-02-06
---

## Motivação

O disco principal do meu computador é criptografado usando LUKS. Se o seu disco principal não é criptografado, recomendo fortemente que use algum tipo de criptografia para proteger seus dados. Sem criptografia, _qualquer pessoa_ pode remover o disco do computador e ler _todos_ os arquivos. Cada sistema operacional oferece uma ou mais soluções para criptografar um disco inteiro, como o Bitlocker no Windows e o LUKS no Linux.

Porém, a segurança de um disco criptografado é tão boa quanto a força da sua senha. Memorizar e digitar uma senha enorme toda vez que ligar seu PC não é muito conveniente. Portanto, procurei uma solução para trazer mais segurança sem precisar aumentar a complexidade da sua senha. É aí que entra o TPM, um padrão de _hardware_ dedicado a funções de segurança. No cenário mais comum o _chip_ TPM é usado como única chave criptográfica do dispositivo, o que significa que seria muito difícil ler os dados ao retirar o disco do computador. Mas como não há nenhuma senha, o sistema operacional vai iniciar automaticamente ao ligar o PC, o que também não é muito seguro.

Assim, o objetivo aqui é configurar uma partição LUKS para usar uma chave criptográfica armazenada no _chip_ TPM **combinada** com uma senha. Um ataque de força bruta diretamente no disco fora do PC se torna mais difícil, já que a chave criptográfica do TPM é (provavelmente) mais complexa que apenas sua senha. E tentar desbloquear a partição sem retirar o disco também se torna mais difícil já que o TPM impõe uma velocidade máxima para cada tentativa de autenticação.

## Como fazer

As etapas foram testadas no Fedora 39, mas devem funcionar em todas as distros que usam `dracut` (Fedora, RHEL, Gentoo, Debian etc) e `systemd`.

E, é claro, recomendo ter _backup_ de todas as informações importantes antes de tentar seguir estas etapas.

**É essencial ter pelo menos uma outra senha registrada na partição LUKS** para não correr o risco de perder completamente seu acesso. O recomendado é ter uma senha bem longa (como uma sequência de 8-12 palavras, por exemplo), a qual será usada apenas até configurar a outra senha atrelada à chave do TPM ou caso o TPM falhe por algum motivo. Se você já tem uma partição LUKS com uma senha menor, basta adicionar a senha grande antes de prosseguir. Você pode pular essas etapas se quiser manter sua senha atual como senha de recuperação caso o TPM falhe.

### Listar _slots_ da partição LUKS

Primeiro, encontre o caminho da partição LUKS com o comando `lsblk -o NAME,FSTYPE,UUID,MOUNTPOINTS`. A partição será listada com o tipo _crypto_LUKS_. Anote o nome da partição.

Verifique quais _slots_ estão preenchidos:

```bash
systemd-cryptenroll /dev/disk
```

Substituindo `disk` pelo nome da partição.

### Adicionar senha de recuperação

Adicione a senha de recuperação a um novo _slot_ com o seguinte comando:

```bash
systemd-cryptenroll /dev/disk --password
```

### Remover senha antiga (opcional)

A partir do resultado da primeira etapa, sabemos qual _slot_ contém a senha antiga a ser apagada. É interessante apagar a senha antiga pois ela provavelmente não é tão forte quanto a senha de recuperação nova, mas é uma etapa opcional. **Tenha muito cuidado ao limpar _slots_ da partição LUKS**, você pode acabar sem acesso à partição se não fizer corretamente. **Recomendo ter um _backup_ de todas as informações**.

**Antes de apagar a senha antiga, reinicie e verifique se é possível usar a senha nova com sucesso**. Somente depois disso, execute:

```bash
systemd-cryptenroll /dev/disk --wipe-slot=SLOT
```

Trocando `SLOT` pelo número do _slot_ a ser apagado.

### Adicionar módulo ao dracut

Primeiro, é necessário instalar `tpm-tss2`, que provavelmente estará disponível nos repositórios da sua distribuição (talvez com o nome `tpm2-tools`). Em seguida, adicione esse módulo ao `dracut` incluindo a seguinte linha ao arquivo `/etc/dracut.conf.d/myflags.conf`:

```
add_dracutmodules+=" tpm2-tss "
```

Geramos o _initramfs_ com o módulo tpm2-tss:

```bash
dracut --hostonly --no-hostonly-cmdline /boot/initramfs-linux.img
```

E reinicie o computador.

### Adicionar TPM ao LUKS com `cryptenroll`

Agora, registre o _token_ do TPM na partição LUKS de interesse. Você pode encontrar o caminho para a partição com o comando `lsblk -o NAME,FSTYPE,UUID,MOUNTPOINTS`. A partição será listada com o tipo _crypto_LUKS_. Anote o nome da partição e **substitua o `abc1` em `/dev/abc1` abaixo pelo nome**.

A opção `tpm2-with-pin=yes` é a responsável por garantir o comportamento desejado de usar a chave armazenada no TPM **e** uma senha.

```bash
systemd-cryptenroll --tpm2-device=auto --tpm2-with-pin=yes /dev/abc1
```

Será necessário digitar a senha escolhida.

Confira que de fato há um _token_ registrado com o nome `systemd-tpm2`, bem como um novo _slot_ preenchido.

```bash
cryptsetup luksDump /dev/nvme0n1p3
```

### Configurar `cryptsetup`

Copie o UUID da partição LUKS usando o comando `lsblk -o NAME,FSTYPE,UUID,MOUNTPOINTS` novamente.

Adicionar ao arquivo `etc/crypttab.initramfs`:

```
root  UUID=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX  none  tpm2-device=auto
```

**Trocando o UUID pelo código copiado.**

Vamos gerar o _initramfs_ novamente:

```bash
dracut --hostonly --no-hostonly-cmdline /boot/initramfs-linux.img
```

Agora basta reiniciar e digitar a senha atrelada à chave do TPM! Caso a autenticação com a senha atrelada ao TMP dê errado basta usar a senha de recuperação configurada acima e tentar seguir as etapas novamente.

## Limitações

O TPM não é perfeito, na verdade [há relatos](https://pulsesecurity.co.nz/articles/TPM-sniffing) em que foi possível extrair a chave do TPM com acesso físico à máquina. No entanto, esse ataque funcionava _justamente_ porque não havia senha atrelada à chave do TPM, então a chave era automaticamente enviada ao processador para permitir a leitura da partição criptograda ao ligar o computador. Com o método descrito aqui esse ataque não seria possível. _Isso não quer dizer que os chips TPM não possam ter vulnerabilidades_. Porém, mesmo no cenário em que a chave é extraída do TPM ainda seria necessário descobrir sua senha. Ou seja, no pior cenário voltaríamos ao nível de segurança do LUKS com senha sem TPM.
