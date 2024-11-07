---
title: "Por que novas cloroquinas virão"
header:
  overlay_image: /assets/images/new_hcqs/drugs.jpg
  caption: "Photo by [Adrian Baciu](https://freeimages.com//photographer/a_dutzu-83304) from [FreeImages](https://freeimages.com/)"
  show_overlay_excerpt: false
categories:
  - Blog
tags:
  - Pandemic
  - Science
  - Statistics
excerpt: 'Nós devemos focar em explicar por que terapias ineficazes podem parecer serem muito eficazes e mostrar os benefícios de ensaios clínicos de qualidade.'
---
_English version [here](https://mathpn.github.io/new-hcqs/)_

## Cloroquina e COVID-19
Não é novidade que a cloroquina (ou hidroxicloroquina) já foi a droga prometida para derrotar (ou pelo menos amenizar) a pandemia de COVID-19 em curso. E todos sabemos que a história curta porém complicada da cloroquina (CQ, para encurtar) não é [animadora](https://sciencebasedmedicine.org/hydroxychloroquine-to-treat-covid-19-evidence-cant-seem-to-kill-it/).

A CQ chegou à atenção da mídia e do público geral quando pesquisadores chineses [notaram](https://www.medrxiv.org/content/10.1101/2020.03.22.20040758v3) que nenhum paciente de um grupo de 80 que tomavam CQ para tratamento de lúpus havia se infectado com o vírus Sars-Cov-2 (causador da COVID-19). Esse tipo de evidência é muito especulativo e, por mais que possa apontar na direção de hipóteses válidas, não deve ser exagerado. A amostra de 80 pacientes é extremamente pequena e os pacientes com lúpus podem aderir ao distanciamento social mais, uma vez que são mais suscetíveis a doenças infecciosas por conta dos tratamentos aos quais são submetidos. Ainda assim, _as evidências foram exageradas_, especialmente depois da publicação de um [estudo francês](https://www.mediterranee-infection.com/wp-content/uploads/2020/03/Hydroxychloroquine_final_DOI_IJAA.pdf) com _inúmeras falhas_, no qual a combinação da CQ com o antibiótico azitromicina (o qual provavelmente não faz nada contra vírus, uma vez que atua contra bactérias) supostamente levou a uma melhora absurdamente mais rápida de pacientes hospitalizados (leia [aqui](https://sciencebasedmedicine.org/are-hydroxychloroquine-and-azithromycin-an-effective-treatment-for-covid-19/) para saber mais sobre esse estudo).

Como se diz sempre: afirmações extraordinárias requerem evidências extraordinárias. Mas as evidências não mais que ordinárias e muito questionáveis a favor da CQ contra a COVID-19 rapidamente se tornaram populares, com [políticos](https://www1.folha.uol.com.br/poder/2020/07/diagnosticado-com-covid-19-bolsonaro-toma-hidroxicloroquina-em-video-e-pergunta-eu-confio-e-voce.shtml) e até algumas autoridades da saúde defendendo seu uso. Desde março, diversos estudos com mais rigor científico investigaram esse uso da CQ (leia [aqui](https://www.bmj.com/content/369/bmj.m1849), [aqui](https://www.nejm.org/doi/full/10.1056/NEJMoa2016638), [aqui](https://academic.oup.com/cid/advance-article/doi/10.1093/cid/ciaa1009/5872589#.XxCYlMdGoJM), [aqui](https://www.medrxiv.org/content/10.1101/2020.07.15.20151852v1) e [aqui](https://www.acpjournals.org/doi/10.7326/M20-4207)). Não surpreende que todos esses estudos (ensaios clínicos randomizados) não encontraram nenhuma evidência de que a CQ apresente qualquer benefício contra a COVID-19.

Ainda assim, algumas lideranças políticas ainda defendem a CQ com grande entusiasmo e seu uso ainda é bastante popular. Aqui no Brasil, não apenas o presidente Bolsonaro defende seu uso indiscriminado, como também planos de saúde distribuem ['kits COVID'](https://noticias.uol.com.br/saude/ultimas-noticias/redacao/2020/07/19/cloroquina-unimed-kit-covid.htm) abjetos, os quais contêm CQ e outras drogas, para pacientes contaminados.

Nessa enxurrada de coisas sem sentido, pode-se perguntar: como chegamos a esse ponto? Não é uma pergunta fácil, com múltiplos fatores atuando - como o descrédito de autoridades e da ciência, o populismo de direita com tons negacionistas, a alta esperança diante de uma doença sem terapia e vários outros. Mas de todos esses fatores, gostaria de focar em um: como nós, cientistas, estamos **falhando em explicar por que testes clínicos bem controlados são necessários** (leia [aqui](https://www.bbc.com/portuguese/geral-53896553) para mais uma explicação nesse sentido). Não tentarei explicar o que são os testes clínicos randomizados, há diversos materiais excelentes sobre esse tópico.

Penso que essa falha se deve em partes a uma falta de entendimento intuitivo de noções estatísticas e científicas básicas, as quais serão exploradas brevemente aqui.

## Probabilidades basais e o erro de jogar a moeda

Vamos supor que há uma doenças se espalhando sem nenhuma terapia disponível, com mortalidade baixa (1%). Agora, vamos supor também que um certo tratamento, com evidências bem fracas a seu favor, ganha atenção e popularidade. Vamos chamar esse tratamento de droga "Vai Que (**VQ**) funciona". As pessoas começam a tomar o VQ e relatam que _suas recuperações foram muito rápidas e tranquilas_. Conforme isso acontece milhares de vezes, é tantador, quase _irresistível, concluir que a droga VQ funciona_, certo? Não.

Assumindo que a droga não faz absolutamente nada, vamos construir uma tabela simples. As colunas indicam se a pessoa tomou VQ ou não, enquanto as linhas indicam se a pessoas morreu ou não (com mortalidade de 1%).

![Table with innefective treatment](/assets/images/new_hcqs/tabela_1.png){: .align-right}

Nesse exemplo, de 10.000 pessoas com a doença, metade tomou VQ (para facilitar a visualização), e 50 pessoas morreram em ambos os grupos (tomando VQ ou não). Quando vemos essa tabela, resta evidente _que a droga parece não funcionar_. Contudo, considere que 4950 pessoas que tomaram VQ estão perfeitamente bem, e **muitas se não a maioria delas atribuirão sua sobrevivência à droga, enquanto as 50 que morreram não serão ouvidas.**

Agora vamos simular um novo cenário. Dessa vez, a droga piorou as coisas:

![Table with harmful treatment](/assets/images/new_hcqs/tabela_2.png){: .align-right}

Novamente, ao olhar a tabela é fácil perceber que _a droga VQ levou a um aumento de 100% na mortalidade!_ Mas ainda há 4900 pessoas (isto é, 98% daqueles que tomaram a droga) que sobreviveram e podem defender a VQ com todo seu estusiasmo.

Um último exemplo, desta vez um mais realista:

![Table with useless treatment](/assets/images/new_hcqs/tabela_3.png){: .align-right}

A droga não tem nenhum efeito, mas imagine ficar sabendo sobre os casos apenas por relatos de indivíduos e pela cobertura midiática. _Os números se tornam obscuros e é fácil tirar conclusões erradas_.

Esses exemplos ilustram que, em um cenário real, é muito difícil perceber a real dimensão das coisas nesse nível de detalhe, e **evidência anedótica** - isto é, quando alguém te conta que ele ou ela melhorou após tomar VQ - **não deve ser levada tão a sério!** E ainda que a tabela mostrasse algum efeito positivo de VQ, isso não seria o suficiente. _Pessoas que decidem tomar VQ podem ser diferentes das que não tomam em vários aspectos que influenciam a chance de sobrevivência._ **Esses viéses só podem ser corrigidos com testes clínicos randomizados.**

## Doenças não são um jogar de moeda

Intuitivamente, nosso senso de probabilidade se aproxima a um jogar de moeda. Ou seja, pensamos: tenho essa doença e posso morrer ou não (um jogar de moeda, com 50/50% de chance). _"Eu posso até tomar essa droga Vai Que, ela pode me ajudar"_ (50/50). _"Se eu sobreviver, a droga provavelmente ajudou. Melhor ainda, se muitas pessoas sobrevivem após tomar VQ, a droga tem que funcionar!"_

O erro deve ser óbvio a essa altura. Enquanto quase todos sabem que sua chance de morrer não é 50% (nesse caso, é de 1%), é difícil levar essas probabilidades em conta intuitivamente e nós somos levados em direção ao cenário 50/50. Sob a influência desse viés (50/50), **quando milhares de pessoas sobrevivem após tomar VQ, nós tendemos a pensar que a droga deve estar funcionando precisamente porque ignoramos a mortalidade baixa**. Qual é a probabilidade que a droga realmente funcione? Se a evidência é muito fraca, podemos considerar que é a mesma de uma _droga aleatória qualquer funcionar_, o que é, evidentemente, muito improvável.

Essas probabilidades, 1% de mortalidade e quase zero de chance de uma droga aleatória funcionar são chamadas **[probabilidades basais](https://en.wikipedia.org/wiki/Prior_probability) (ou _a priori_)**. Se a evidência sobre um caso particular é fraca (por exemplo, _"eu vou sobreviver a essa doença?"_), **nós devemos sempre usar a probabilidade basal como um ponto de partida** (1% de chance de morrer). A partir daí, podemos _cuidadosamente_ andar em ambas as direções com as evidências sobre um caso particular (por exemplo, "eu tenho problema cardíaco, o que aumenta meu risco de morrer", ou, "eu sou bastante jovem, o que reduz o meu risco no geral"). **Quanto mais fraca a evidência, menos nós devemos nos desviar da probabilidade basal.**

Sobre a droga, se a evidência é muito fraca, nós devemos considerar a probabilidade basal como a chance de que qualquer droga aleatória funcione contra a doença, ou a chance que outra droga da mesma classe (algumas podem já ter sido testadas) sejam efetivas.

Entretanto, intuitivamente nós tendemos a **superestimar muito as evidências fracas de casos particulares** e somos atraídos em direção ao cenário 50/50. _"Meu vizinho estava quase morto e se recuperou após tomar VQ"_, por exemplo. Isso também pode acontecer com doenças com alta mortalidade (câncer, por exemplo) uma vez que apenas aqueles que sobrevivem podem falar sobre suas terapias, e apenas um punhado dos conhecidos daqueles que faleceram irão criticar alguma droga ou terapia.

Isso, sozinho, é suficiente para assegurar que novas cloroquinas virão. Com doenças novas ou já existentes circulando, muitas pessoas sobreviverão após tomarem diversas drogas ou tratamentos que podem muito bem fazer nada. No mundo real, **é muito difícil dizer a % de pessoas que sobreviveram após tomar uma droga comparado à % entre aqueles que não tomaram.** Isso torna um raciocínio adequado quase impossível sem estudos bem executados - _ensaios clínicos randomizados._

## Sem evidência a favor

A segunda razão pela qual novas cloroquinas virão é uma grande falha de comunicação entre a comunidade científica e o público geral: em termos científicos, _nós não podemos formalmente provar uma afirmação negativa_. Ou seja, cientistias nunca afirmam que a droga X ou Y teve sua _ineficácia comprovada_ contra COVID-19 ou qualquer outra condição. Isso se deve à forma como os estudos são desenhados: eles buscam diferenças entre grupos submetidos a diferentes tratamentos. Assim, o estudo pode afirmar que (1) houve diferença entre os grupos (por exemplo, pessoas tomando a droga X morreram menos) ou (2) que não houve diferença. A ausência de diferença entre grupos não é prova formal da ineficácia da droga, mas com certeza é uma boa evidência nessa direção.

Ao longo da pandemia de COVID-19, diversos estudos não encontraram diferenças entre grupos que tomaram CQ ou placebo em termos de mortes e desfechos hospitalares. Com vários estudos independentes chegando às mesmas conclusões, é seguro dizer com boa segurança que a [_cloroquina não funciona_](https://www.bbc.com/news/world-us-canada-53575964).

Ainda assim, autoridades ficam com os termos técnicos e afirmam que não há evidências científicas que a CQ funcione contra COVID-19. Isso, porém, é capcioso. É uma afirmação verdadeira, é claro, mas ela ignora o fato que simplesmente _não há qualquer evidência de qualidade a favor da CQ._ Isso é uma grande falha de comunicação que precisa ser corrigida. Nós jamais provaremos, em termos científicos, que a CQ é ineficaz contra COVID-19, assim como jamais provaremos que comer chocolate também é ineficaz contra COVID-19 ou qualquer outra doença!

Não obstante, **o fato de que afirmações negativas não são nunca comprovadas em termos científicos não é desculpa para insistirmos em terapias ineficazes nem para estudá-las para sempre**, esperando que um estudo milagroso vá provar sua eficácia. Ainda que um estudo faça isso, _a evidência deve ser tomada em conjunto_, e um estudo positivo entre muitos negativos pode ocorrer por puro acaso. Quanto mais estudos fazemos, maior a chance de um falso positivo ocorrer.

## Consequências de "cloroquinas"

A ciência possui um método imperfeito, porém o melhor disponível até hoje, para evitar pesquisas desnecessárias: o processo de revisão por pares. Todo pedido de financiamento de pesquisa é avaliado por outros membros da comunidade científica. É muito provável que sem a atenção e a pressão do público geral **a CQ nunca teria sido tão testada como foi**. Para dizer de forma simples: nunca houve evidência suficiente para considerá-la uma terapia viável. Assim, se a revisão por pares tradicional tivesse sido seguida, **uma enorme quantia de recursos financeiros e humanos poderia ter sido melhor empregada**, em outros ensaios mais promissores para lidar com a pandemia de COVID-19, por exemplo.

Isso aconteceu aqui no Brasil com a [fosfoetanolamina](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5102686/). Um Professor universitário começou a fazer afirmações sem embasamento que essa droga era a "cura" para o câncer. Ela ganhou popularidade rapidamente, pressionando políticos e reguladores a testarem-na e até mesmo a permitirem sua comercialização sem comprovação de eficácia. De fato, o presidente Bolsonaro escreveu um [projeto de lei que legalizou seu uso médico](https://www.sciencemag.org/news/2016/04/brazil-president-signs-law-legalizing-renegade-cancer-pill) enquanto deputado federal. O projeto foi aprovado e depois revogado pela justiça. Até mesmo ensaios com humanos foram realizados, falhando em provar sua eficácia contra o câncer (leia [aqui](https://sboc.org.br/noticias/item/826-estudo-sobre-fosfoetanolamina-e-suspenso-por-nao-constatar-beneficio)). De novo, uma quantidade enorme de recursos foi gasta em pesquisa inútil por conta da pressão para testar uma terapia sem evidências boas de estudos _in vitro_ ou em animais.

# Conclusão

Nossa negligência em relação às probabilidades basais, combinada com uma quantidade enorme de evidência anedótica de colegas em redes sociais, vizinhança ou outros espaços é um tônico poderoso para a popularidade de terapias ineficazes. Isso, combinado com a falha de comunicação que exploramos acima, é a combinação perfeita para a pseudociência ou até mesmo bobagem pura prosperarem.

Isso, em conjunto com outros fatores sociais e culturais, é uma das principais razões pela qual terapias completamente ineficazes como a [homeopatia](https://sciencebasedmedicine.org/homeopathy-is-worthless-and-not-always-harmless/) ainda são tão populares. Nós, enquanto cientistas, devemos prestar mais atenção à popularidade de tratamentos inúteis. Mesmo que eles não apresentem efeitos colaterais (nem efeito nenhum, como a homeopatia), eles servem como solo fértil para noções equivocadas, como o caso da CQ, florescerem.

**Nós devemos focar em explicar por que terapias ineficazes podem parecer serem muito eficazes e mostrar os benefícios de ensaios clínicos de qualidade.**
