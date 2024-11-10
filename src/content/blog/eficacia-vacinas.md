---
title: "O que NÃO É a eficácia de uma vacina"
tags:
  - Pandemic
  - Science
description: "O que exatamente é a eficácia de uma vacina? Esse número se tornou muito popular, mas nem todas as interpretações sobre ele estão corretas."
pubDatetime: 2021-06-13
---

Felizmente, a vacinação contra a Covid-19 está acelerando muito em diversos países, fato que eventualmente levará a uma redução drástica no número de casos, internações e mortes pela doença. Durante o ano de 2020, voltamos nossa atenção ao desenvolvimento das vacinas, as quais, apesar de terem sido desenvolvidas em velocidade recorde, pareciam gerar novos dados a conta-gotas. Ao fim, a eficácia foi a grande estrela do noticiário: tínhamos não apenas uma, mas várias vacinas seguras e eficazes!

No entanto, um foco excessivo foi dado à tal eficácia. Tomamos vacinas há muitos anos e sequer sabemos suas eficácias - elas _simplesmente funcionam_. As vacinas contra a Covid-19, independentemente da eficácia de cada uma, _vão suprimir a pandemia quando grande parte da população for vacinada_. Ainda assim, a eficácia já se tornou assunto popular e, surpreendentemente, não encontrei fontes com uma explicação simples e correta do que é a tal da eficácia.

Afinal de contas, o que é a _eficácia de uma vacina_? Vamos aqui definir a _eficácia_ e olhar o que ela **não é**. Definir o não é a eficácia é uma boa forma de remover interpretações equivocadas que já estão nas nossas mentes.

A eficácia de uma vacina (Efi) é definida como:

$Efi = 1 - RR$

Sendo RR o **Risco Relativo** entre os grupos que tomaram vacina ou placebo nos **testes de fase III**:

$RR = \frac{Risco\ grupo\ vacinado}{Risco\ grupo\ placebo}$

Assim, se ao final de um estudo com 1000 pessoas em cada grupo há 340 infectados no grupo placebo e 79 no grupo vacinado, temos:

$Risco\ grupo\ vacinado = \frac{79}{1000} = 0,079$

$Risco\ grupo\ placebo = \frac{340}{1000} = 0,34$

A eficácia da vacina portanto é:

$Efi = 1 - \frac{0,079}{0,34} = 1 - 0,232 = 0,768$

Ou seja, a eficácia dessa vacina fictícia é de 76,8%. O que isso **não** significa?

## 1) Probabilidade de alguém ficar doente

Quando os resultados de eficácia da Coronavac saíram, houve analogias bem-intencionadas e outras maliciosas sobre sua eficácia.

> "Não desistam do tratamento precoce. Não desistam, tá? A vacina é para quem não pegou ainda. E esta vacina que está aí é 50% de eficácia. Ou seja, se jogar uma moedinha para cima, é 50% de eficácia. Então, está liberada a aplicação no Brasil."

<cite>Valor Econômico</cite> --- [Bolsonaro volta a lançar dúvidas sobre a CoronaVac, mas diz que ela é “do Brasil”](https://valor.globo.com/politica/noticia/2021/01/18/em-recado-a-doria-bolsonaro-diz-que-vacina-do-brasil-no-de-um-governador.ghtml)
{: .small}

Essa fala de Jair Bolsonaro é obviamente uma tentativa de prejudicar a imagem da Coronavac, mas carrega um erro comum sobre o que é a eficácia. A analogia com a moeda dá a entender que uma pessoa vacinada tem 50% de chance de não ficar doente e, portanto, 50% de chance de ficar doente. Isso é falso. Uma pessoa precisa _entrar em contato com uma quantidade suficiente de vírus por tempo suficiente_ para se infectar, e _somente essas_ podem ficar doentes ou não. A eficácia é uma redução do risco **relativo**, ou seja, em relação a um grupo não vacinado nos testes. Se a chance de ficar doente fosse "aleatória" como uma moeda jogada pro alto, as pessoas dos grupos placebo e vacina ficariam doentes na mesma proporção, levando a eficácia a 0. Assim, o cenário é bem melhor do que 50% de chance de ficar doente. Se sua probabilidade de ficar doente nos próximos 6 meses fosse, digamos, de 20%, com essa vacina ela seria de 10% (redução _relativa_ de 50%), se mais nada mudasse.

## 2) Proporção de protegidos na população

Uma ideia bem comum e que circula muito é que, se a eficácia de uma vacina é de 80%, então 80 em cada 100 vacinados. É bastante intuitivo. Mas essa explicação simplifica tanto o conceito que acaba transmitindo uma informação equivocada. Na realidade, as vacinas em geral induzem resposta imune em praticamente todos os vacinados (leia mais [aqui](https://www.uol.com.br/vivabem/noticias/redacao/2020/11/17/estudo-coronavac-induz-resposta-imune-em-97-dos-casos-butantan-comemora.htm) e [aqui](https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(20)31604-4/fulltext)). É verdade que a resposta imune varia entre indivíduos, mas isso _não significa_ que, no caso de 50% de eficácia, _50% das pessoas estão desprotegidas_. Quase todos os vacinados apresentam resposta imune, mas dois fatores fazem com que alguns fiquem doentes mesmo assim: primeiro, há pessoas cujos sistemas imunes não funcionam tão bem, deixando-as mais suscetíveis a infecções; segundo mas não menos importante, se expor ao vírus brevemente no supermercado ou conversar por horas sem máscara com alguém infectado leva a uma exposição _muito_ diferente, o que aumenta a probabilidade de ficar doente mesmo estando vacinado. Uma mistura desses fatores imunológicos (variação entre as pessoas) e ambiental (exposição ao vírus) explica em grande parte porque é possível ficar doente mesmo após a vacinação. Na realidade, isso não é surpreendente, uma vez que é possível se reinfectar com diversas doenças.

Lembrando da definição de eficácia: é um **risco relativo** entre vacinados e grupo placebo. Dizer a porcentagem de pessoas que não ficariam doentes após a vacinação seria um risco **absoluto**. Para calculá-lo, seria necessário propositalmente expor pessoas vacinadas ao vírus em um laboratório, o que seria obviamente antiético. Além disso, como vimos acima, a exposição ao vírus pode variar muito, tornando esse resultado de pouca utilidade no mundo real. Por isso, os estudos de fase III (para determinar eficácia) são feitos em grandes grupos que seguem sua vida normalmente sem saber se tomaram vacina ou placebo, para tentar mimetizar ao máximo as condições reais nas quais as pessoas se expõem ao vírus.

Portanto, **praticamente todos que tomaram vacinas estão protegidos em alguma medida**. A eficácia nos informa **quão menor é o risco de ficar doente** em relação a quem não foi vacinado no estudo.

## 3) Probabilidade de **eu** ficar doente

Você então pode estar pensando: _ótimo, quanto eu tomar uma vacina, estarei protegido, já que a eficácia não é a proporção de pessoas protegidas_. Isso é verdade, mas há mais um detalhe. **A eficácia é calculada a nível _coletivo_** e não individual. O risco relativo é calculado a partir do número de pessoas que tiveram sintomas em cada grupo. Assim, a eficácia é a redução _média_ de risco relativo para o grupo todo. Não é possível saber a eficácia individual pois o cálculo depende de dados de um grande número de pessoas. Assim, é razoável assumir que mais ou menos metade das pessoas tem um risco relativo acima da média, enquanto a outra metade, abaixo. Dessa forma, a rigor é _impossível_ saber qual é o _seu_ nível de proteção após a vacina, e exames sorológicos e afins [não vão ajudar](https://www.uol.com.br/vivabem/noticias/redacao/2021/04/13/preciso-fazer-teste-de-anticorpos-depois-de-me-vacinar.htm). Sabemos de alguns fatores que influenciam essa proteção: em geral, pessoas mais velhas ou imunossuprimidas apresentam alguma redução da eficácia das vacinas, por exemplo. Ainda assim, é razoável supor que, em geral, sua proteção, caro leitor, deve ser mais ou menos parecida com a eficácia observada na população do estudo.

Assim, vamos assumir que você tomou uma vacina com 60% de eficácia. Isso quer dizer que, caso você se encontre com alguém infectado, há 40% de chance de ficar doente? Como você já deve imaginar, não. A eficácia é um **risco relativo**, portanto a chance é 60% menor do que uma pessoa não vacinada _na mesma situação_. Por um lado, isso é ótimo: a chance de se infectar nunca é 100% em cada situação e, portanto, uma redução de 60% leva a uma chance menor que 40% de se infectar. Por outro lado, nos expomos repetidas vezes no cotidiano. Assim, o fato de ser um **risco relativo** faz com que a **chance de se infectar após a vacinação dependa diretamente da chance de se infectar na sua região e da sua exposição**. Ou seja, _quanto maior o número de pessoas infectadas_ em uma região ou país, _maior o risco de se infectar_, estando vacinado ou não. Os 80% de redução se dão em cima do **risco daquela população**. E é claro, se você se **expuser mais**, sua **chance de se infectar aumenta de forma proporcional** mesmo vacinado.

## 4) Se estou vacinado, é impossível ter um quadro grave

Infelizmente, até mesmo veículos confiáveis espalharam esse pensamento (exemplos [aqui](https://www.uol.com.br/vivabem/noticias/redacao/2021/04/21/covaxin-tem-eficacia-de-100-em-casos-graves-mostram-dados-preliminares.htm), [aqui](https://oglobo.globo.com/sociedade/vacina/vacina-de-oxford-100-eficaz-contra-casos-graves-de-covid-19-em-estudo-nos-eua-24935608) e [aqui](https://www.cnnbrasil.com.br/saude/2021/01/07/vacina-do-butantan-eficacia-e-de-78-em-casos-leves-e-100-em-graves)). Na maioria dos estudos fase III, não houve nenhuma morte ou até mesmo nenhuma pessoa com quadro grave no grupo vacinado. Portanto, a eficácia é numericamente de 100%. **Não existe eficácia real de 100%**. Os estudos de fase III apenas não continuaram por _tempo suficiente_ para que houvesse um caso grave ou morte no grupo vacinado. Em geral o número de mortes foi pequeno mesmo no grupo placebo, simplesmente pela curta duração dos estudos. Assim, podemos afirmar que **a eficácia contra casos graves e mortes deve ser bem alta** e muito provavelmente maior do que a eficácia para casos leves, mas a verdade é que **não sabemos qual é esse número exato** pois não há _dados suficientes_.

A alta eficácia contra casos graves deve aliviar os hospitais mesmo diante de um aumento moderado no número de casos na comunidade. Ainda assim, **quanto maior o _número de casos_** (diagnosticados ou não) na sua região, maior será o risco de se contaminar e, portanto, **maior será o número de _vacinados internados e eventualmente mortos_**, já que **a redução no risco é relativa e nunca chega a 100%**, mesmo que chegue quase lá.

## Conclusões

Vamos relembrar a definição da eficácia de uma vacina:

$Efi = 1 - RR$

Sendo RR o Risco Relativo entre os grupos que tomaram vacina ou placebo nos testes de fase III:

$RR = \frac{Risco\ grupo\ vacinado}{Risco\ grupo\ placebo}$

A eficácia é a redução **relativa do risco** que pessoas vacinadas apresentam na _média_ em relação a um grupo não vacinado nos estudos. Assim, _todos os vacinados estão protegidos em alguma medida_, o que não quer dizer que não é possível ficar doente. Como essa redução é _relativa_, sua chance de se infectar estando vacinado depende diretamente do número de pessoas infectadas na sua região no momento. Soma-se a isso o fato de as pessoas _mudarem seu comportamento_ após tomar uma vacina: por se sentirem mais protegidas, elas acabam se permitindo correr mais risco. Isso é razoável, mas pode contribuir para um aumento dos novos casos enquanto uma minoria está vacinada.

Se o _número de casos subir_ consideravelmente após uma pessoa se vacinar, é possível que ela tenha um _risco similar de ficar doente_ ao que tinha antes de se vacinar. Isso não é pessimismo vão: as vacinas foram capazes de eliminar doenças altamente contagiosas de muitos países (sarampo e rubéola, por exemplo) e até de extinguir a varíola do mundo. A vacina da gripe apresenta uma eficácia de 40-60% e mesmo assim é perfeitamente capaz de evitar surtos epidêmicos e muitas mortes pela doença. Com a vacinação de **grande parte da população**, como quase todos os vacinados apresentam algum nível de proteção, o vírus tem bem mais dificuldade de contaminar outras pessoas e o **número de novos casos tende a cair até próximo de 0**. Portanto, as **vacinas funcionam de fato a nível coletivo**.

Tudo isso mostra a importância de **vacinarmos a grande maioria da população o mais rápido possível**. A eficácia contra Covid-19 de uma vacina na geladeira (ou de não tomar vacina) é sempre 0. Logo o foco deve ser **aumentar a chegada de novas doses** e, ao mesmo tempo, **usar todas as doses** em estoque. O Brasil sofre com problemas nas duas frentes: de um lado, [negamos acordos de compras](https://www1.folha.uol.com.br/poder/2021/05/governo-ignorou-10-emails-da-pfizer-sobre-vacinas-em-1-mes-mostram-documentos-da-cpi.shtml) e recebemos doses de [forma atrasada](https://www1.folha.uol.com.br/equilibrioesaude/2021/06/apos-ignorar-emails-da-pfizer-bolsonaro-agora-pede-antecipacao-da-entrega-de-doses.shtml); de outro, por motivos diversos, apenas os estados de São Paulo e Mato Grosso do Sul usaram [mais de 80% das doses recebidas até 15/06/2021](https://especiais.g1.globo.com/bemestar/vacina/2021/mapa-brasil-vacina-covid/). A cada dia que doses passam na geladeira - ou sequer foram compradas - _2000 brasileiros_ morrem de Covid-19. A nível individual, é um grande alívio receber uma vacina e estar mais protegido. Mas, como agora você sabe, **a proteção dos vacinados também depende do controle do número de casos da doença, o qual virá conforme o número de vacinados aumentar.**
