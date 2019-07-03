//===================================================
function tw(Dest) {
	var dro = '../twitter/data/js/tweets/';
	var dst = Dest;
	var dstR,pq,pqV,xa,te,tlMx=300,tl,mes;
	var doc = document;
	var vaq = []; //vetor arquivos .js
	var oEstat,oEstatG,oEs;
	setTimeout(init,200);
	//===============================================
	var vClick = {
		'urls':function(ev) {
			return ev.target.tagName=='SPAN'?ev.target.innerHTML:false;
		}
		,'media':function(ev) {
			return ev.target.tagName=='SPAN'?ev.target.innerHTML:false;
		}
		,'hashtags':function(ev) {
			return  ev.target.tagName=='SPAN'?'https://twitter.com/hashtag/'+trimm(ev.target.innerHTML,'#'):false;
		}
		,'user_mentions':function(ev) {
			return usr(ev);
		}
		,'usr':function(ev) {
			return usrAt(ev);
		}
		,'dt':function(ev) {
			var i = ev.target.getAttribute('id_str');
			var sp = getParentByTagName(ev.target,'p').getElementsByTagName('span')[0];
			// dados do twitter tem lixos id numérico causa overflow, e 
			// 		em vez de consertar criaram um segundo id_str.
			//https://twitter.com/sgnyjohn/statuses/1134448891070418944
			//https://twitter.com/sgnyjohn/statuses/1134448891070419000
			var r = 'https://twitter.com/'
				+trimm(sp.innerHTML.substrRat(' '),'@')+'/statuses/'+i
			;
			//lert(r);
			return r;
		}
	};
	//===============================================
	function click(ev) {
		var cl = getParentAttr(ev.target,'class').leftAt(' ');
		var o = vClick[cl];
		if (!o) {
			//lert('cl='+cl+' '+ev.target);
			return;
		}
		var url = o(ev);
		if (url) {
			window.open(url,'_blank');
		}
	}
	//===============================================
	var mostra = {
		'urls': function(v) {
			return '<span>'+v.expanded_url+'</span>';
		}
		,'media':function(v) {
			return '<span>'+v.expanded_url+'</span>';
		}
		,'hashtags':function(v) {
			return '<span>#'+v.text+'</span>';
		}
		,'user_mentions': function(v) {
			return usr(v);
		}
	};
	//===============================================
	function usrAt(ev) {
		var sp = getParentByTagName(ev.target,'span');
		return 'https://twitter.com/'+sp.innerHTML.substrRat(' ');
	}
	function usr(ou) {
		return '<span class=usr><b>'+ou.name+'</b> @'+ou.screen_name+'</span>';
	}
	//===============================================
	function mostraUm(v,cl) {
		te++;
		if (tl>tlMx) return; //limite na tela

		tl++;
		
		//quebra mes
		if (!cl && mes!=v.created_at.substring(0,7)) {
			mes = v.created_at.substring(0,7)
			dom.new('p','<span>'+mes+'</span>',{class:'mes'},dstR);
		}

		//estatistica mes
		oEstat.inc(mes.substring(0,4),1);
		
		//mostra...
		var o = dom.new('div','',{class:(cl?cl:'tw')},dstR);
		dom.new('p'
			,usr(v.user)+' <span id_str="'+v.id_str+'" class="dt ent">'+v.created_at+'</span>'
			,{class:'usrDt ent'}
			,o
		);
		if (v.retweeted_status 
				&& equals(v.text,'RT @'+v.retweeted_status.user.screen_name+': '
						+v.retweeted_status.text.substring(0,Math.min(50,v.retweeted_status.text.length)))
			) {
		} else {
			dom.new('p',troca(v.text,'\n','<br>'),{class:'text'},o);
			//dom.new('p',v.created_at,{class:'at'},o);
			for (var i in mostra) {
				var ret = aevalStr(v.entities[i],mostra[i],' - ');
				//alert(i+' ty='+typeof(oe));
				if (ret) {
					dom.new('p',ret,{class:i+' ent'},o);
				}
			}
		}
		if (v.retweeted_status) {
			mostraUm(v.retweeted_status,'rt');
		}
	}
	//===============================================
	function mostraAq(a,b,tx) {
		var vt;
		try {
			eval('vt='+tx.substrAt('\n'));
			//mostra
			for (var i=0;i<vt.length;i++) {
				if (!oEstatG) oEs.inc1(vt[i].created_at.substring(0,4));
				if (vt[i].text.toLowerCase().indexOf(pqV)!=-1) {
					mostraUm(vt[i]);
				}
			}
			//proximo aq
			xa+=1
			if (xa<vaq.length) {
				setTimeout(pede,10);

			} else {
				// 
				if (!oEstatG) oEstatG = oEs;
				
				//fim, mostra estatística
				var es = doc.createElement('table');
				es.style.cssText = 'width:100%;';
				var ln = doc.createElement('tr');
				es.appendChild(ln);
				
				var c = doc.createElement('td');
				c.style.cssText = 'width:20%;';
				c.innerHTML=oEstat.toHtml()
				ln.appendChild(c);
				
				//grafico, cruza as 2 estat.
				var vg  = oEstatG.getVetor();
				var vf  = oEstat.getVetor();
				var vr = [];
				for (prop in vg) {
					var vl = vf[prop]?vf[prop]:0;
					var pr = vl/vg[prop]*100;
					vr[vr.length] = [
						prop
							+'<br> ('+vg[prop]+'):'
							+'<br><b>'+vl+'</b>'
							+'<br>'+format(pr,1)+'%'
						,pr					
					];
				}
					
				
				var c = doc.createElement('td');
				c.style.cssText = 'width:80%;';
				c.innerHTML=(new graphBar(vr)).getHtml();//oEstat.toGraphBar()
				ln.appendChild(c);
				
				dstR.insertBefore(es,dstR.firstChild);
				
				//
				es = doc.createElement('p');
				es.innerHTML='FIM pesquisa "'+pqV+'"'
					+'<br>listados: '+tl
					+'<br>encontrados: '+te
					+'<hr>'
				;
				dstR.insertBefore(es,dstR.firstChild);
				
			}
			
			
		} catch (e) {
			alert('faz tw='+erro(e)+" eval("+'vt='+tx.substrAt('\n')+')');
		}
	}
	//===============================================
	function pede(ev) {
		//carrega
		var aj = new carregaUrl();
		//aj.charSet = 'UTF-8';
		//aj.debug = true;
		aj.abre(dro+vaq[xa],mostraAq);				
	}
	//===============================================
	function pesq(ev) {
		if (pqV==pq.value) {
			return;
		}
		pqV = pq.value;
		cookiePut('twitter.pqV',pqV);
		
		dstR.innerHTML = '';
		xa = 0;
		te = 0; 
		tl = 0;
		mes = '';
		if (!oEstatG) oEs = new estat('total posts');		
		oEstat = new estat('tw por mês');
		pede();
	}
	//===============================================
	function init1(a,b,tx) {
		var d = doc.createElement('div');
		//lert(a+'=='+tx);
		d.innerHTML = tx;
		var v = d.getElementsByTagName('a');
		//lert('tam='+v.length);
		var p = doc.createElement('pre');
		for (var i=0;i<v.length;i++) {
			var t = v[i].innerHTML;
			if (t.indexOf('.js')!=-1) {
				p.innerHTML += t+'\n';
				vaq[vaq.length] = t;
			}
		}
		vaq.sort(function(a,b) {return (a>b?-1:(a<b?1:0));});
		p.innerHTML = troca(''+vaq,',','\n');
		dstR.appendChild(p);
		if (!vazio(pq.value)) {
			pesq();
		}
	}
	//===============================================
	function init() {
		dst = dst?dst:doc.body;
		//input
		//pq = doc.createElement('input');
		//pq.addEventListener('change',pesq);
		//dst.appendChild(pq);
		pq = dom.new('input',cookieGet('twitter.pqV'),{change:pesq,class:'sel'},dst);
		dom.new('input','search',{type:'button',click:pesq,class:'sel'},dst);
		dstR = dom.new('div','...',{click:click,class:'dst'},dst);
		
		//lert('dst='+dst);
		var aj = new carregaUrl();
		//aj.charSet = 'UTF-8';
		//aj.debug = true;
		aj.abre(dro,init1);
		
		//style
		if (doc.getElementsByTagName('style').length==0) {
			var css = `
				BODY,INPUT,SELECT {font-family:"Helvetica Neue",Helvetica,Arial,sans-serif,"Droid Sans";}
				H1 {color:black;font-size:140%; }
				H2 {color:red;font-size:120%; }
				P { margin: 5px; }
				DIV.dialogo {min-width:30%;}
				TABLE {cels-spaccing:0;border-collapse:collapse;border-spacing:0;}
				INPUT {margin:3px;border-style:outset;}
				
				DIV.tw {border-top:2px solid red;margin-left:5px;}
				DIV.rt {border-top:1px solid red;margin-left:2em;}
				SPAN.dt {font-size:80%;color:#905090;}
				P.text {font-size:113%;padding:7px;line-height:150%;}
				P.ent {line-height:150%;}
				P.ent SPAN {cursor:pointer;padding:3px 3px 1px 3px;}
				P.hashtags SPAN {color:red;border:1px solid #d0d0d0;}
				P.urls SPAN {color:blue;border:1px solid #d0d0d0;}
				P.media SPAN {color:green;border:1px solid #d0d0d0;}
				P.user_mentions SPAN {color:#509090;border:1px solid #d0d0d0;}
				P.mes {margin:13px 0 0;}
				P.mes SPAN {padding:2px 13px;font-size:110%;font-weight:bold;background-color:blue;color:#d0d0d0;}
			`	+(false && browse.mobile?'BODY,INPUT,SELECT{font-size:180%;}':'')
			;
			var head = doc.head || doc.getElementsByTagName('head')[0];
			var style = doc.createElement('style');
			style.type = 'text/css';
			if (style.styleSheet) {
				style.styleSheet.cssText = css;
			} else {
				style.appendChild(doc.createTextNode(css));
			}
			head.appendChild(style);		
		}
		
	}
}
