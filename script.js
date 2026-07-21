const WHATS='https://wa.me/5519974198194';
const laws=[
 {cat:'tea',title:'Clínica Escola do Autista',desc:'Autoriza a criação e implantação de Clínica Escola do Autista para atendimento de alunos autistas e capacitação de educadores no Município de Sumaré.',ref:'Lei Ordinária nº 7.157/2023',date:'25/09/2023',url:'https://www.legislacaodigital.com.br/Sumare-SP/LeisOrdinarias/7157-2023'},
 {cat:'pcd',title:'Balcão Municipal de Empregos da Pessoa com Deficiência',desc:'Cria um canal municipal para informar, orientar e auxiliar pessoas com deficiência no acesso a vagas de emprego e inclusão no mercado de trabalho.',ref:'Lei Ordinária nº 6.784/2022',date:'30/03/2022',url:'https://www.legislacaodigital.com.br/Sumare-SP/LeisOrdinarias/6784-2022'},
 {cat:'pcd',title:'Acompanhamento integral na rede municipal',desc:'Prevê acompanhamento para estudantes com dislexia, TDAH, transtornos de aprendizagem e déficits visuais e auditivos na rede municipal de ensino.',ref:'Lei Ordinária nº 6.683/2021',date:'11/11/2021',url:'https://legislacaodigital.com.br/Sumare-SP/LeisOrdinarias/6683-2021'},
 {cat:'pcd',title:'Semana Municipal da Pessoa com Deficiência Intelectual e Múltipla',desc:'Inclui no calendário oficial do município uma semana dedicada à conscientização e valorização da pessoa com deficiência intelectual e múltipla.',ref:'Lei Ordinária nº 6.655/2021',date:'30/09/2021',url:'https://legislacaodigital.com.br/Sumare-SP/LeisOrdinarias/6655-2021'},
 {cat:'pcd',title:'Brinquedos adaptados em áreas de lazer',desc:'Determina a instalação de brinquedos adaptados para pessoas com deficiência em áreas de lazer públicas e privadas em novos empreendimentos e locais já existentes.',ref:'Lei Ordinária nº 6.638/2021',date:'15/09/2021',url:'https://legislacaodigital.com.br/Sumare-SP/LeisOrdinarias/6638-2021'},
 {cat:'pcd',title:'Reserva de mesas e cadeiras acessíveis',desc:'Prevê reserva de 10% de mesas e cadeiras para pessoas com deficiência física ou intelectual, idosos e gestantes em praças de alimentação e restaurantes.',ref:'Lei Ordinária nº 6.590/2021',date:'11/06/2021',url:'https://legislacaodigital.com.br/Sumare-SP/LeisOrdinarias/6590-2021'},
 {cat:'tea',title:'Espaços de lazer inclusivos',desc:'Cria espaços de lazer inclusivos, com mais segurança e acolhimento para crianças com e sem necessidades especiais, especialmente crianças com TEA.',ref:'Lei Ordinária nº 6.573/2021',date:'14/05/2021',url:'https://legislacaodigital.com.br/Sumare-SP/LeisOrdinarias/6573-2021'},
 {cat:'pcd',title:'Cadastro único da pessoa com deficiência',desc:'Cria cadastro municipal para atendimento e acompanhamento da pessoa com deficiência, ajudando o poder público a organizar informações e serviços.',ref:'Lei Ordinária nº 6.547/2021',date:'05/04/2021',url:'https://legislacaodigital.com.br/Sumare-SP/LeisOrdinarias/6547-2021'},
 {cat:'tea',title:'Carteira de Identificação do Autista',desc:'Cria a Carteira de Identificação do Autista para facilitar a identificação da pessoa com TEA e o acesso a direitos, atendimentos e prioridades.',ref:'Lei Ordinária nº 6.538/2021',date:'18/03/2021',url:'https://legislacaodigital.com.br/Sumare-SP/LeisOrdinarias/6538-2021'},
 {cat:'tea',title:'Política Municipal de Atendimento Integrado à Pessoa com TEA',desc:'Institui diretrizes municipais para atendimento integrado à pessoa com Transtorno do Espectro Autista, fortalecendo a rede de cuidado e inclusão.',ref:'Lei Ordinária nº 6.447/2020',date:'17/12/2020',url:'https://legislacaodigital.com.br/Sumare-SP/LeisOrdinarias/6447-2020'},
 {cat:'pcd',title:'Meia-entrada para pessoas com deficiência',desc:'Dispõe sobre o benefício da meia-entrada para estudantes, idosos, pessoas com deficiência e jovens comprovadamente carentes em eventos culturais e esportivos.',ref:'Lei Ordinária nº 6.172/2019',date:'03/04/2019',url:'https://legislacaodigital.com.br/Sumare-SP/LeisOrdinarias/6172-2019'},
 {cat:'pcd',title:'Dia Municipal do Surdo',desc:'Inclui no Calendário Oficial de Eventos do Município o Dia Municipal do Surdo, fortalecendo a visibilidade e a conscientização sobre a comunidade surda.',ref:'Lei Ordinária nº 6.114/2018',date:'05/11/2018',url:'https://legislacaodigital.com.br/Sumare-SP/LeisOrdinarias/6114-2018'}
];

function lawCard(l){
 const base=location.pathname.includes('/leis-e-direitos/')?'../':'';
 const icon=l.cat==='tea'?base+'assets/icons/neuro.svg':base+'assets/icons/access.svg';
 const label=l.cat==='tea'?'TEA • Autismo':'PCD • Acessibilidade';
 const extra=l.date?`<span class="tag light">${l.date}</span>`:'';
 const hint=l.review?`<small class="law-hint">${l.review}</small>`:'';
 return `<article class="law-card" data-cat="${l.cat}"><img class="law-icon" src="${icon}" alt="${label}"><div class="law-tags"><span class="tag">${label}</span>${extra}</div><h3>${l.title}</h3><p>${l.desc}</p><div class="ref">Referência: ${l.ref}</div>${hint}<a class="law-link" href="${l.url}" target="_blank" rel="noopener noreferrer">Consultar fonte oficial</a></article>`;
}

function mountLaws(limit){
 const el=document.getElementById('lawPreview')||document.getElementById('lawGrid');
 if(el) el.innerHTML=(limit?laws.slice(0,6):laws).map(lawCard).join('');
}

async function loadCounter(){
 try{
  const r=await fetch('/campanha/api.php?action=count',{cache:'no-store'});
  if(!r.ok) throw new Error('counter_unavailable');
  const j=await r.json();
  const total=Number.isFinite(Number(j.total))?Number(j.total):0;
  ['homeCounter','campaignCounter','publicCounter'].forEach(id=>{
   const e=document.getElementById(id);
   if(e){
    e.textContent=total.toLocaleString('pt-BR');
    e.setAttribute('aria-label',`${total} apoios registrados`);
   }
  });
 }catch(error){
  console.warn('Não foi possível carregar o contador de apoios.',error);
 }
}

function setupVideoFallback(){
 const videos=[...document.querySelectorAll('video')];
 videos.forEach(video=>{
  const source=video.querySelector('source[src]');
  if(!source||!source.src.includes('centro-tea.mp4')) return;

  const card=video.closest('.project-video-card');
  const directLinks=[...document.querySelectorAll('a[href*="centro-tea.mp4"]')];

  const markUnavailable=()=>{
   if(card){
    card.innerHTML='<div class="media-unavailable" role="status"><strong>Vídeo em preparação</strong><p>A apresentação da Clínica Escola será publicada assim que o arquivo oficial estiver disponível.</p></div>';
   }
   directLinks.forEach(link=>{
    link.removeAttribute('href');
    link.setAttribute('aria-disabled','true');
    link.classList.add('is-disabled');
    link.textContent='Vídeo em preparação';
   });
  };

  video.addEventListener('error',markUnavailable,{once:true});
  source.addEventListener('error',markUnavailable,{once:true});
 });
}

function setupAccessibleNavigation(){
 document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener('click',event=>{
   const id=link.getAttribute('href');
   if(!id||id==='#') return;
   const target=document.querySelector(id);
   if(!target) return;
   event.preventDefault();
   const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   target.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
   target.setAttribute('tabindex','-1');
   target.focus({preventScroll:true});
  });
 });
}

mountLaws(location.pathname.includes('leis-e-direitos')?0:6);
loadCounter();
setupVideoFallback();
setupAccessibleNavigation();
