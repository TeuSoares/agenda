var app = new Framework7({
    // App root element
    root: '#app',
    // App Name
    name: 'My App',
    // App id
    id: 'com.myapp.test',
    // Enable swipe panel
    panel: {
      swipe: 'left',
    },
    // Add default routes
    routes: [
      {
        path: '/home/',
        url: 'index.html?a=7',
      },{
        path: '/tarefas',
        url: 'tarefas.html?a=8',
        on:{
          pageInit:function(){
            pageTarefas();
          },
        },
      },
    ],
    // ... other parameters
  });
  var mainView = app.views.create('.view-main');

  if(window.openDatabase){
    // Criando banco de dados
    db = openDatabase("DB_AGENDA","0.1","Base de dados local", 5*1021*1024);

    // Criando tabela tarefas
    db.transaction(function(query){
      query.executeSql("CREATE TABLE IF NOT EXISTS tarefas (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT, descricao TEXT, data TEXT)");
    
      // Gravando configurações
      query.executeSql("CREATE TABLE IF NOT EXISTS config (id INTEGER PRIMARY KEY AUTOINCREMENT, theme INTEGER)");  // INTEGER = Inteiro
    
      query.executeSql("SELECT theme FROM config",[],function(query,result){
        linha = result.rows.length;
        //alert(linha);
        if(linha == 0){
          query.executeSql("INSERT INTO config (theme) VALUES (1)",[]);
        }
      });
    });
  }

  // Inicializando o JS
$(document).ready(function(){

    // Array
    // var nomes = ["Fernando","José"];
    // alert(nomes+"\n");
    // alert(nomes[1]);
    // document.write(nomes+"<br>");

    // var arrayNumero = [1,2,3,4,5,6,7,8,9,10];
    // for(var i = 0;i<10;i++){
    //   alert(arrayNumero[i]);
    // }

    db.transaction(function(query){
      query.executeSql("SELECT theme FROM config",[],function(query,result){
        linha = result.rows;
        for(var i=0; i < linha.length; i++){
          result_theme = linha[i].theme;
        }
        if(result_theme == 0){
          $(".bg").toggleClass("theme-dark");
          $(".panel").toggleClass("panel2");
          $('input[type="checkbox"]').prop('checked', true);
        }
      });
    });

    // Capturando data atual
    now = new Date;
    dias = new Array("Domingo","Segunda","terça","Quarta","Quinta","Sexta","Sábado");
    meses = new Array("Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez");
    $(".data-atual").html(dias[now.getDay()]+", "+now.getDate()+" de "+meses[now.getMonth()]+" de "+ now.getFullYear());
    // alert(now);

    // Função modo noturno
    $(".btn-noturno").click(function(){
      db.transaction(function(query){
        if(result_theme == 1){
          db.transaction(function(query){
            query.executeSql("UPDATE config SET theme = 0",[]);
          });
        }else{
          db.transaction(function(query){
            query.executeSql("UPDATE config SET theme = 1",[]);
          });
        }
      });
      $(".bg").toggleClass("theme-dark");
      $(".panel").toggleClass("panel2");
    });

    mostrarDados();

    /* Botao exluir atrasadas */
    $('.open-confirm').on('click', function () {
      app.dialog.confirm('Deseja exluir todas as tarefas atrasadas?', function () {
        app.dialog.alert('Feito!');
        mostrarDados();
      });
    });

   day = ("0" + now.getDate()).slice(-2);
   month = ("0" + (now.getMonth() + 1)).slice(-2);
   today = now.getFullYear()+"-"+(month)+"-"+(day);

}); // FIM document page index

// Funções de escopo global
function mostrarDados(){
  dados = "";
text = "";
// Executar consulta SQL
  db.transaction(function(query){
    query.executeSql("SELECT * FROM tarefas ORDER BY data ASC",[],function(query,result){     // [] = array
      linha = result.rows;

      for(var i = 0; i < linha.length; i++){
        inicial = linha[i].titulo.substring(0,1);   // Primeira letra 
        dataF = linha[i].data;    // formatando a data
        split = dataF.split('-');
        novaData = split[2]+"/"+split[1]+"/"+split[0];
        
         //alert(today);
        if(dataF < today){
          dados +='<li class="swipeout">';
            dados+='<div class="swipeout-content item-content bg-color-red color-text">';
                dados+='<div class="item-media color_c2"><span>'+inicial+'</span></div>';
                dados+='<div class="item-title atividade">'+linha[i].titulo.substring(0,30)+'</div>';
                dados+='<div class="item-left small">'+novaData+'</div>';
            dados+='</div>'; // FIM swipeout
            dados+='<div class="swipeout-actions-right">';
                dados+='<a href="#" class="swipeout-close" onclick="descricao('+linha[i].id+')"><i class="f7-icons">eye_fill</i>"</a>';
                dados+='<a href="#" class="swipeout-delete" onclick="deletar('+linha[i].id+')"><i class="f7-icons">trash</i></a>';
            dados+='</div>'; // FIM swipeout-actions
          dados+='</li>'; // FIM li
        }else{
          dados +='<li class="swipeout">';
            dados+='<div class="swipeout-content item-content">';
                dados+='<div class="item-media color_c"><span>'+inicial+'</span></div>';
                dados+='<div class="item-title atividade">'+linha[i].titulo.substring(0,30)+'</div>';
                dados+='<div class="item-left small">'+novaData+'</div>';
            dados+='</div>'; // FIM swipeout
            dados+='<div class="swipeout-actions-right">';
                dados+='<a href="#" class="swipeout-close" onclick="descricao('+linha[i].id+')"><i class="f7-icons">eye_fill</i>"</a>';
                dados+='<a href="#" class="swipeout-delete" onclick="deletar('+linha[i].id+')"><i class="f7-icons">trash</i></a>';
            dados+='</div>'; // FIM swipeout-actions
          dados+='</li>'; // FIM li
        }
        
      } // FIM for
      
      $("#list").html(dados);
    });
  });
  
}

// Mostra descrição
function descricao(id){
  desc = "";
  titulo = "";

  db.transaction(function(query){
    query.executeSql("SELECT titulo, descricao FROM tarefas WHERE id=?",[id],function(query,result){
      linha = result.rows;
      for(var i = 0; i < linha.length; i++){
        titulo+='<div class="item-title">'+linha[i].titulo+'</div>';
        desc+='<div class="item-content">'+linha[i].descricao+'</div>';
      }
      app.dialog.alert(desc,titulo);
    });
  });
}

// Remove tarefas atrasadas
function deletarAtrasadas(today){
  db.transaction(function(query){
    query.executeSql("DELETE FROM tarefas WHERE data<?",[today]);
  });
  var day = ("0" + now.getDate()).slice(-2);
  var month = ("0" + (now.getMonth() + 1)).slice(-2);
  var today = now.getFullYear()+"-"+(month)+"-"+(day);
    // alert(today);
}

// Remove tarefa
function deletar(id){
  db.transaction(function(query){
    query.executeSql("DELETE FROM tarefas WHERE id=?",[id]);
  });
}

// FIM escopo global

// Função page tarefas
function pageTarefas(){
  $(document).ready(function(){

    // var day = ("0" + now.getDate()).slice(-2);
    // var month = ("0" + (now.getMonth() + 1)).slice(-2);
    // var today = now.getFullYear()+"-"+(month)+"-"+(day);
    
    $("#dataTarefa").val(today);

    $('.btn-agendar').click(function(){
      var titulo = $("#titulo").val();
      var descricao = $("#descricao").val();
      var dataTarefa = $("#dataTarefa").val();

      if(titulo.length < 5 || titulo.trim() == ""){
        app.dialog.alert("Preencha o título corretamente","AVISO");
        return false;
      }
      if(descricao.length > 100 || descricao.trim() == ""){
        app.dialog.alert("Preencha a descrição corretamente","AVISO");
        return false;
      }
      // if(dataTarefa < today){
      //   app.dialog.alert("A data não pode ser retroativa","AVISO");
      //   $("#dataTarefa").val(today);
      //   return false;
      // }
      // alert(titulo+" | "+descricao);

      var notification = app.notification.create({
        title:'cadastro de Tarefas',
        text:'Tarefa agendada com sucesso',
        closeTimeout:3000,
      });
      // Inserindo informações no banco
      db.transaction(function(query){
        query.executeSql("INSERT INTO tarefas (titulo,descricao,data) VALUES (?,?,?)",[titulo,descricao,dataTarefa]);
        notification.open();
        $("#titulo").val("");
        $("#descricao").val("");
        $("#dataTarefa").val(today);
      });

      mostrarDados();

    });
  });
}
