# ML-Vesti

---

Matematički fakultet, Univerzitet u Beogradu  
Nikola Vuković 1090/2020

## Uvod i cilj rada

U 2019. sam imao priliku da razvijam neuronsku mrežu za festival koji
je kao temu imao veštačku inteligenciju. Rad je za cilj imao da 
imitira domaće portale za vesti, kompletiran sa veb sajtom koji liči
na pravi portal za vesti. Taj rad je dokumentovan na [svom repozitorijumu](https://github.com/sterlu/Fles).

![Fleš Njuz](https://github.com/sterlu/Fles/blob/master/screenshot.jpg)

Ideja rada za kurs mašinskog učenja u 2020/21. na Matematičkom fakultetu
je da kreira model sa istom svrhom, odnosno model koji generiše naslove
informacionih portala, ali koristeći modernije pristupe od RNN-ova. 
Konkretno isprobano je prilagođavanje istreniranih GPT2 modela nad domaćim
naslovima. 

Od literature, primarno je korišćena [HuggingFace dokumentacija](https://huggingface.co/transformers/),
uz dodatne članke raznih autora na internetu. [Skripta predmeta](http://ml.matf.bg.ac.rs/readings/ml.pdf)
je naravno poslužila kao teorijska osnova. 

## Tehnički osvrt

### Skup podataka

Korišćen je skup od oko 2,3 miliona naslova sa domaćih portala. Bitno je 
napomenuti glavni deo pretprocesiranja. Kako se naslovi često sastoje od 
kraćeg "prednaslova" pisanog velikim slovima, na koji se naslov semantički
ne nadovezuje, ključno je bilo odstraniti te delove. Moguće je razviti 
model koji generiše samo prednaslove, ali to nije bio cilj rada.


Pre pretprocesiranja:
```
NORA, TAMNAVA I ŠUMADIJA NA IZLOŽBI Za Vidovdan u Kragujevcu otvoreni dan Vojske Srbije
```

Nakon odstranjenog prednaslova:
```
Za Vidovdan u Kragujevcu otvoreni dan Vojske Srbije
```

Pored pomenutog, sporadični ćirilični karakteri su  konvertovani u
latinicu, izbačene su sintagme koje ukazuju na specifične sajtove,
i filtrirani su naslovi koji: a) se previše često ponavljaju, pa time
preprilagođavaju model (primarno vremenska prognoza); b) sadrže morbidne 
termine koje ne želimo da imamo u modelu (crna hronika). 

Skup podataka izgleda ovako:

```
Ronioci nakon 30 minuta potrage pronašli Velibora (29)
Ponosni roditelji ćerki dali ime jake simbolike
Rusi nudili nagodbu Amerikancima: Bili spremni da glasaju za Šmita POD OVIM USLOVIMA
Šta će biti sa računima građana?
Francuska odlozila ukidanje restrikcija: Ne želimo RESTARTOVANJE EPIDEMIJE
Doživela nervni slom, nisu mogli da je podignu sa poda
Anegdote Srba za vreme NATO bombardovanja: Sedeli smo u memli skloništa kada je pijani lik upao i lupio glupost kojoj se i danas smejem
Pitanja na koja vlast IZBEGAVA ODGOVOR: Ko je napadao i ubijao svedoke saradnike i članove njihovih porodica?
Kako bi velike sile kao što su Kina i Amerika u stvari trebalo da se TAKMIČE
Biće dovoljno za HITNE SLUČAJEVE Institut Torlak isporučiće Srpskoj 50 doza seruma protiv zmijskog ujeda
Psihijatar svedočio na suđenju za stravičan udes u Nišui koji je odneo dva života
Naftali postigao sporazum: Jevrejski doseljenici pristali da napuste sporni područje na Zapadnoj obali
Stanišić i Simatović krivi, osuđeni na po 12 GODINA!
Brnabić: Srpska ekonomija u prvom kvartalu najbolja u Evropi
Osim Beograda još jedan grad ima DVOCIFREN broj novozareženih
Imam i dalje emocije KIJA SE NADALA POMIRENJU, ALI ON SE VRATIO DUŠICI Evo kako je pričala pre samo nekoliko dana o bivšem dečku (VIDEO)
Na Arktičkom krugu 48 stepeni, a leto se tek zagreva
Veća onlajn prodaja donela je i više krivotvorene robe, a evo i gde je u Evropi najviše prevarenih kupaca
...
```

### Tokenizacija

- Pri treniranju GPT2, korišćena je byte-level BPE tokenizacija. Pre nego 
  što prihvatimo to kao podrazumevan način enkodovanja, zapitajmo se da 
  li je potreban.

- Koje mane jednostavnog tokenizera popravlja _byte-level encoder_?
  Jednostavni modeli ne trpe greške u pisanju, i ne podržavaju retke reči.
  Uzevši u obzir prirodu korpusa, pretpostavio sam da BPE ne donosi bitna
  poboljšanja za ovaj zadatak. Retko se može očekivati greška u naslovu,
  reči se uglavnom ponavljaju, a i sama veličina rečnika nas ne ograničava.
  
![Broj reči po broju ponavljanja](https://github.com/sterlu/ML-Vesti/blob/master/slike/analiza-korpusa.png) 

- Ipak, kako za BPE važi da je trenutno najbolji način tokenizacije, 
  isprobao sam i BPE i tradicionalnu prostu tokenizaciju.

### Modeli

- Model se bavi prilagođavanjem (_fine-tuning_) postojećih modela GPT2
  arhitekture. GPT2 je model baziran na transformerskoj arhitekturi, 
  nenadgledano treniran na velikoj količini teksta, sposoban da generiše
  eseje koji zvuče prirodno.
  
- Pri treniranju korišćena je najmanja varijanta GPT2 modela. Postoji i 
  DistillGPT2 model (destilovan GPT2) koji obećava slične performanse kao
  GPT2 za manje resursa - brže treniranje, generisanje i manji model. 
  Međutim, rezultati sa DistillGPT2 nisu bili idealni, pa je fokus ipak 
  prebačen na originalni GPT2 model.

## Rezultati

![Poređenje tokenizera](https://github.com/sterlu/ML-Vesti/blob/master/slike/poredjenje-tokenizera.png)

- Primećujemo da se po formalnim merama prost tokenizer bolje pokazao. 
  Isti zaključak možemo dobiti i empirijski - BPE tokenizer često generiše
  reči koje inače ne postoje, pa kreiran naslov nema smisla.

_GPT2 + BPE tokenizer, temperatura 0.6:_ 
```
Evo šta je Darko Lazić rekao o Đokovićujte
Posle ovog snimka, ovaj snimak je dobio ime! (VIDEO)
Ne može da izdrži, ali se nije pojavioin i
Na granici sa Hrvatskom se čeka i do 20 minuta! (VIDEO)
Vučić u Srbiji: Reprezentativac u borbi protiv terorizmami
```

_GPT2 + jednostavni tokenizer, temperatura 1.0:_ 
```
Bivši trener Zvezde OTKRIO plan koji je oduševio Evropu ( FOTO )
Vučić u Vašingtonu sa : nije opcija, ne postoje stvari
Nakon ŽESTOKE svađe sa Borom PEVAČICOM, ONA je jedna stvar za to!
me, nije ni znao gde će!
Ovo je pet albuma koje bi trebalo da preslušate danas ( FOTO )
```


## Dodatak: Zaključci iz treniranja

- Veličina serije (_batch size_) utiče na brzinu treniranja, ali i na 
  preciznost. Postoje naučni radovi koji potkrepljuju ovo, što sam u nekoj
  meri empirijski potvrdio. Manje veličine su već posle prve epohe imale
  manji loss, ali je treniranje teklo toliko sporije, da je bilo nemoguće 
  dovršiti treniranje (Google Colab se prekine).
- Ne treba preterivati sa brzinom učenja. [Jedan od modela](https://github.com/sterlu/ML-Vesti/blob/master/2.3%20-%20Treniranje%20GPT2%20pokusaj%201.ipynb)
  je bio treniran sa brzinom učenja reda veličine e-3 naspram e-5 kod 
  ostalih. Model je konvergirao brže nego drugi, a posle pete epohe je vrlo
  naglo konvergirao, tako da je loss na kraju bio skoro 0. Model je na 
  kraju bio toliko preprilagođen, da je generisao samo jednu reč iznova i 
  iznova.