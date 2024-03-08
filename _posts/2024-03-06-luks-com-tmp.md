---
title: "Como criptografar seu computador com LUKS e TPM"
header:
  overlay_image: /assets/images/default_overlay.jpg
  show_overlay_excerpt: false
categories:
  - Tutorial
tags:
  - Linux
  - Security
excerpt: "Tutorial de como criptografar um disco com LUKS e TPM no Linux"
---

# Motivação

O disco principal do meu computador é criptografado usando LUKS. Se o seu disco principal não é criptografado, recomendo fortemente que use algum tipo de criptografia para proteger seus dados. Sem criptografia, _qualquer pessoa_ pode remover o disco do computador e ler _todos_ os arquivos. Cada sistema operacional oferece uma ou mais soluções para criptografar um disco inteiro, como o Bitlocker no Windows e o LUKS no Linux.

Porém, a segurança de um disco criptografado é tão boa quanto a força da sua senha. Memorizar e digitar uma senha enorme toda vez que ligar seu PC não é muito conveniente, então procurei uma solução para trazer mais segurança sem precisar aumentar a senha. Aí que entra o TPM, um padrão de _hardware_ dedicado a funções de segurança. No cenário mais comum o _chip_ TPM é usado como única chave criptográfica do dispositivo, o que significa que seria muito difícil ler os dados ao retirar o disco do computador. Mas como não há nenhuma senha, o sistema operacional vai iniciar automaticamente ao ligar o PC, o que também não é muito seguro.

Assim, o objetivo aqui é configurar uma partição LUKS para usar uma chave criptográfica armazenada no _chip_ TPM **combinada** com uma senha. Um ataque de força bruta diretamente no disco fora do PC se torna mais difícil já que a chave criptográfica do TPM é (provavelmente) mais complexa que apenas sua senha. E tentar desbloquear a partição sem retirar o disco também se torna mais difícil já que o TPM impõe uma velocidade máxima para cada tentativa de autenticação.

# Passos

## Adicionar módulos do dracut

Adicionar ao arquivo `/etc/dracut.conf.d/myflags.conf`:

```
add_dracutmodules+=" tpm2-tss "
```

Gerar initramfs:

```bash
dracut --hostonly --no-hostonly-cmdline /boot/initramfs-linux.img
```

reiniciar.

## Adicionar TPM ao LUKS com `cryptenroll`

```bash
systemd-cryptenroll --tpm2-device=auto --tpm2-with-pin=yes /dev/abc
```

conferir:

```bash
cryptsetup luksDump /dev/nvme0n1p3
```

## Configurar `cryptsetup`

Adicionar ao arquivo `etc/crypttab.initramfs`:

TODO pegar UUID
```
root  UUID=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX  none  tpm2-device=auto
```

Gerar initramfs:

```bash
dracut --hostonly --no-hostonly-cmdline /boot/initramfs-linux.img
```
