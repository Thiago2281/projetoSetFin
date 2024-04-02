
const express = require('express')
const app = express()
const port = 3000
var bodyParser = require('body-parser')
const mysql = require('mysql')
var { Parser } = require('json2csv')
/* criar conexão com o bando de dados  */
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE
});
module.exports = pool;


const fs = require('fs');

/* identificar dados passados na URL */
app.use(bodyParser.urlencoded({ extended: false }))

/* padronizar a pasta public como base para acessar imagens e outros dados */
app.use(express.static('public'));

/* usar arquivos ejs como renderização */
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');  
})
let liquidacoes=[]
// /* rota para a cadastrar novos itens */
app.post('/', async (req, res) => {
  

  var situacao = 'DSP101';
  var contaEstoque = '1.1.5.6.1.01.00';
  var contaApagar = '2.1.3.1.1.04.00';
  var tipo = req.body.tipo;
  var numero = req.body.numero;
  var tipoNf = req.body.tipoNF;
  var nf = tipoNf + ' ' + numero;
  var dataNf = new Date(req.body.dataNF);
  let yyyy = dataNf.getFullYear();
  let mm = dataNf.getMonth() + 1;           // Months start at 0!
  let dd = dataNf.getDate();
  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  var formatteddataNf = dd + '/' + mm + '/' + yyyy;
  var dataAt = new Date(req.body.dataAteste);
  var aaaa = dataAt.getFullYear();
  var me = dataAt.getMonth() + 1;           // Months start at 0!
  var dia = dataAt.getDate();
  if (dia < 10) dia = '0' + dia;
  if (me < 10) me = '0' + me;
  var formatteddataAt = dia + '/' + me + '/' + aaaa;
  var dataVenc = new Date(req.body.dataVenc);
  var aaaa = dataVenc.getFullYear();
  var me = dataVenc.getMonth() + 1;         // Months start at 0!
  var dia = dataVenc.getDate();
  if (dia < 10) dia = '0' + dia;
  if (me < 10) me = '0' + me;
  var formatteddataVenc = dia + '/' + me + '/' + aaaa;
  var subitem = req.body.subitem;
  // if (subitem < 10) subitem = '0' + subitem;

  var opcao = req.body.opcao;
  var favorecido = req.body.favorecido;
  var valorBruto = req.body.valorBruto;
  var cnpj = req.body.cnpj;
  var anoEmpenho = req.body.anoEmpenho;
  var numeroEmpenho = req.body.numeroEmpenho;
  var empenho = anoEmpenho + 'NE' + '000' + numeroEmpenho;
  var codRecolhimento = req.body.codRecolhimento;
  var codReceita = req.body.codReceita;
  var percentual = req.body.percentual;
  var contrato = req.body.contrato;
  var ug = req.body.ugEmpenho;
  var ugCC = 'xxx';
  var cc = 'xxx';
  var ano = 'xxx';
  var listaFatura = 'xxx';
  var mes1 = 'xxx'
  var siorg = 'xxx'  
  //-------------------------SERVICO-------------------------------------
  if (req.body.tipo == 'SERVICO') {
    var situacao = 'DSP001';
    var contaEstoque = '3.3.2.3.1.02.00';
    var ugCC = '160046';
    var cc = 'F020404S';
    var referente = req.body.referente;
    let dataHoje = new Date();
    var mes1 = dataHoje.getMonth() + 1;
    if (mes1 < 10) {
      var mes1 = '0' + mes1;
    }
    var ano = '2024';
    var siorg = '30320'
    var lf = req.body.lf;
    var listaFatura = '2024LF000' + lf;
    function descrever(tipo, subitem, nf, formatteddataNf, opcao) {
      return new Promise(async (resolve, reject) => {
        let sql = 'select descricao from servico where id=?';
        pool.query(sql, [subitem], function (error, resultado) {
          if (error) {
            return reject('Erro: ' + error.message)
          }
          var descricao = 'APROPRIACAO DE ' + tipo + ' - ' + [resultado[0].descricao] + '\nNF DATA/NR: ' + nf + ' ' + formatteddataNf + ' ' + referente + '\nEMPRESA ' + opcao

          return resolve(descricao)
        });
      });
    }

    let descricao = await descrever(tipo, subitem, nf, formatteddataNf, opcao)

    let liquidacao = {opcao:opcao, tipo:tipo, cnpj:cnpj, contrato:contrato, nf:nf, valorBruto:valorBruto, formatteddataNf:formatteddataNf, formatteddataAt:formatteddataAt, formatteddataVenc:formatteddataVenc, descricao:descricao, situacao:situacao,empenho:empenho, subitem:subitem, contaEstoque:contaEstoque, contaApagar:contaApagar, situacao:situacao, siorg:siorg, mes1:mes1, codRecolhimento:codRecolhimento, codReceita:codReceita, percentual:percentual,cc:cc, ugCC:ugCC, ano:ano, ug:ug, listaFatura:listaFatura};
    liquidacoes.push(liquidacao);
    res.redirect('/')

  }

  if (req.body.tipo == 'MATERIAL PERMANENTE') {
    var situacao = 'DSP201';
    var contaEstoque = '1.2.3.1.1.08.01';
    function descrever(tipo, subitem, nf, formatteddataNf, opcao) {
      return new Promise(async (resolve, reject) => {
        let sql = 'select descricao from permanente where id=?';
        pool.query(sql, [subitem], function (error, resultado) {
          if (error) {
            return reject('Erro: ' + error.message)
          }
          var descricao = 'APROPRIACAO DE ' + tipo + ' - ' + [resultado[0].descricao] + '\nNF DATA/NR: ' + nf + ' ' + formatteddataNf + '\nEMPRESA ' + opcao

          return resolve(descricao)
        });
      });
    }

    let descricao = await descrever(tipo, subitem, nf, formatteddataNf, opcao)
    let liquidacao = {opcao:opcao, tipo:tipo, cnpj:cnpj, contrato:contrato, nf:nf, valorBruto:valorBruto, formatteddataNf:formatteddataNf, formatteddataAt:formatteddataAt, formatteddataVenc:formatteddataVenc, descricao:descricao, situacao:situacao,empenho:empenho, subitem:subitem, contaEstoque:contaEstoque, contaApagar:contaApagar, situacao:situacao, siorg:siorg, mes1:mes1, codRecolhimento:codRecolhimento, codReceita:codReceita, percentual:percentual,cc:cc, ugCC:ugCC, ano:ano, ug:ug, listaFatura:listaFatura};
    liquidacoes.push(liquidacao);

    res.redirect('/')
  }

  if (req.body.tipo == 'MATERIAL DE CONSUMO') {
    function descrever(tipo, subitem, nf, formatteddataNf, opcao) {
      return new Promise(async (resolve, reject) => {
        let sql = 'select descricao from consumo where id=?';
        pool.query(sql, [subitem], function (error, resultado) {
          if (error) {
            return reject('Erro: ' + error.message)
          }
          var descricao = 'APROPRIACAO DE ' + tipo + ' - ' + [resultado[0].descricao] + '\nNF DATA/NR: ' + nf + ' ' + formatteddataNf + '\nEMPRESA ' + opcao

          return resolve(descricao)
        });
      });
    }

    let descricao = await descrever(tipo, subitem, nf, formatteddataNf, opcao)
    let liquidacao = {opcao:opcao, tipo:tipo, cnpj:cnpj, contrato:contrato, nf:nf, valorBruto:valorBruto, formatteddataNf:formatteddataNf, formatteddataAt:formatteddataAt, formatteddataVenc:formatteddataVenc, descricao:descricao, situacao:situacao,empenho:empenho, subitem:subitem, contaEstoque:contaEstoque, contaApagar:contaApagar, situacao:situacao, siorg:siorg, mes1:mes1, codRecolhimento:codRecolhimento, codReceita:codReceita, percentual:percentual,cc:cc, ugCC:ugCC, ano:ano, ug:ug, listaFatura:listaFatura};
    liquidacoes.push(liquidacao);

    res.redirect('/')

  }

  if (req.body.tipo == 'MATERIAL DE PNAE') {
    var contaEstoque = '1.1.5.8.1.03.01';
    function descrever(tipo, subitem, nf, formatteddataNf, opcao) {
      return new Promise(async (resolve, reject) => {
        let sql = 'select descricao from consumo where id=?';
        pool.query(sql, [subitem], function (error, resultado) {
          if (error) {
            return reject('Erro: ' + error.message)
          }
          var descricao = 'APROPRIACAO DE ' + tipo + ' - ' + 'MATERIAL DE ASSISTENCIA SOCIAL' + '\nNF DATA/NR: ' + nf + ' ' + formatteddataNf + '\nEMPRESA ' + opcao

          return resolve(descricao)
        });
      });
    }

    let descricao = await descrever(tipo, subitem, nf, formatteddataNf, opcao)
    let liquidacao = {opcao:opcao, tipo:tipo, cnpj:cnpj, contrato:contrato, nf:nf, valorBruto:valorBruto, formatteddataNf:formatteddataNf, formatteddataAt:formatteddataAt, formatteddataVenc:formatteddataVenc, descricao:descricao, situacao:situacao,empenho:empenho, subitem:subitem, contaEstoque:contaEstoque, contaApagar:contaApagar, situacao:situacao, siorg:siorg, mes1:mes1, codRecolhimento:codRecolhimento, codReceita:codReceita, percentual:percentual,cc:cc, ugCC:ugCC, ano:ano, ug:ug, listaFatura:listaFatura};
    liquidacoes.push(liquidacao);

    res.redirect('/')
  };

  if (req.body.tipo == 'MATERIAL DE COOPERATIVA (PNAE)') {
    var contaEstoque = '1.1.5.8.1.03.01';
    function descrever(tipo, subitem, nf, formatteddataNf, opcao) {
      return new Promise(async (resolve, reject) => {
        let sql = 'select descricao from servico where id=?';
        pool.query(sql, [subitem], function (error, resultado) {
          if (error) {
            return reject('Erro: ' + error.message)
          }
          var descricao = 'APROPRIACAO DE ' + tipo + ' - ' + 'MATERIAL DE ASSISTENCIA SOCIAL' + '\nNF DATA/NR: ' + nf + ' ' + formatteddataNf + '\nEMPRESA ' + opcao

          return resolve(descricao)
        });
      });
    }

    let descricao = await descrever(tipo, subitem, nf, formatteddataNf, opcao)
    let liquidacao = {opcao:opcao, tipo:tipo, cnpj:cnpj, contrato:contrato, nf:nf, valorBruto:valorBruto, formatteddataNf:formatteddataNf, formatteddataAt:formatteddataAt, formatteddataVenc:formatteddataVenc, descricao:descricao, situacao:situacao,empenho:empenho, subitem:subitem, contaEstoque:contaEstoque, contaApagar:contaApagar, situacao:situacao, siorg:siorg, mes1:mes1, codRecolhimento:codRecolhimento, codReceita:codReceita, percentual:percentual,cc:cc, ugCC:ugCC, ano:ano, ug:ug, listaFatura:listaFatura};
    liquidacoes.push(liquidacao);

    res.redirect('/')
  }

  if (req.body.tipo == 'MATERIAL DE COOPERATIVA') {
    function descrever(tipo, subitem, nf, formatteddataNf, opcao) {
      return new Promise(async (resolve, reject) => {
        let sql = 'select descricao from consumo where id=?';
        pool.query(sql, [subitem], function (error, resultado) {
          if (error) {
            return reject('Erro: ' + error.message)
          }
          var descricao = 'APROPRIACAO DE ' + tipo + ' - ' + [resultado[0].descricao] + '\nNF DATA/NR: ' + nf + ' ' + formatteddataNf + '\nEMPRESA ' + opcao

          return resolve(descricao)
        });
      });
    }

    let descricao = await descrever(tipo, subitem, nf, formatteddataNf, opcao)
    let liquidacao = {opcao:opcao, tipo:tipo, cnpj:cnpj, contrato:contrato, nf:nf, valorBruto:valorBruto, formatteddataNf:formatteddataNf, formatteddataAt:formatteddataAt, formatteddataVenc:formatteddataVenc, descricao:descricao, situacao:situacao,empenho:empenho, subitem:subitem, contaEstoque:contaEstoque, contaApagar:contaApagar, situacao:situacao, siorg:siorg, mes1:mes1, codRecolhimento:codRecolhimento, codReceita:codReceita, percentual:percentual,cc:cc, ugCC:ugCC, ano:ano, ug:ug, listaFatura:listaFatura};
    liquidacoes.push(liquidacao);
    
    res.redirect('/')
  }
})

app.get('/finalizacao', (req, res) => {
  res.render('finalizacao', {liquidacoes});
  function empty(array) {
    array.length = 0;
  }
  empty(liquidacoes);
})

app.listen(port, () => {
  console.log(`App usando a porta ${port}`)
})

app.use((req, res) => {
  res.status(404).send('Página não encontrada');
});

app.use((req, res) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado');
});

