
const express = require('express')
const app = express()
const port = 3000
var bodyParser = require('body-parser')
const mysql = require('mysql')
var { Parser } = require('json2csv')
/* criar conexão com o bando de dados  */
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'bd',
  user: 'root',
  password: 'senha_root',
  database: process.env.MARIADB_DATABASE,
});
module.exports = pool;
const fs = require('fs');

/* identificar dados passados na URL */
app.use(bodyParser.urlencoded({ extended: false }))

/* padronizar a pasta public como base para acessar imagens e outros dados */
app.use(express.static('public'));

/* usar arquivos ejs como renderização */
app.set('view engine', 'ejs');

app.get('/cadastro', (req, res) => {
  res.render('cadastro');  //{livro:{}});
})

// /* rota para a cadastrar novos itens */
app.post('/cadastro', async (req, res) => {
  console.log(req.body);
  var situacao = 'DSP101';
  var contaEstoque = '115610100';
  var contaApagar = '213110400';
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
  if (subitem < 10) subitem = '0' + subitem;

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


  //-------------------------SERVICO-------------------------------------
  if (req.body.tipo == 'SERVICO') {
    var situacao = 'DSP001';
    var contaEstoque = '332310200';
    var ug = '160046';
    var cc = 'F020404S';
    let dataHoje = new Date();
    var mes1 = dataHoje.getMonth() + 1;
    if (mes1 < 10) {
      var mes1 = '0' + mes1;
    }
    var ano = '2024';
    var siorg = '30320'


    function descrever(tipo, subitem, nf, formatteddataNf, opcao) {
      return new Promise(async (resolve, reject) => {
        let sql = 'select descricao from servico where id=?';
        pool.query(sql, [subitem], function (error, resultado) {
          if (error) {
            return reject('Erro: ' + error.message)
          }
          var descricao = 'APROPRIACAO DE ' + tipo + ' - ' + [resultado[0].descricao] + '\nNF DATA/NR: ' + nf + ' ' + formatteddataNf + '\nEMPRESA ' + opcao
          console.log(descricao)
          return resolve(descricao)
        });
      });
    }

    let descricao = await descrever(tipo, subitem, nf, formatteddataNf, opcao)

    const fields = [{
      label: opcao,
      value: 'field1_name'
    }, {
      label: tipo,
      value: 'field2_name'
    }, {
      label: cnpj,
      value: 'field2_name'
    }, {
      label: favorecido,
      value: 'field1_name'
    }, {
      label: nf,
      value: 'field2_name'
    }, {
      label: valorBruto,
      value: 'field2_name'
    }, {
      label: formatteddataNf,
      value: 'field1_name'
    }, {
      label: formatteddataAt,
      value: 'field2_name'
    }, {
      label: formatteddataVenc,
      value: 'field2_name'
    }, {
      label: descricao,
      value: 'field1_name'
    }, {
      label: situacao,
      value: 'field2_name'
    }, {
      label: empenho,
      value: 'field2_name'
    }, {
      label: subitem,
      value: 'field1_name'
    }, {
      label: contaEstoque,
      value: 'field2_name'
    }, {
      label: contaApagar,
      value: 'field2_name'
    }, {
      label: situacao,
      value: 'field2_name'
    }, {
      label: siorg,
      value: 'field2_name'
    }, {
      label: mes1,
      value: 'field2_name'
    }, {
      label: codRecolhimento,
      value: 'field2_name'
    }, {
      label: codReceita,
      value: 'field2_name'
    }, {
      label: percentual,
      value: 'field2_name'
    }, {
      label: cc,
      value: 'field2_name'
    }, {
      label: ug,
      value: 'field2_name'
    }, {
      label: ano,
      value: 'field2_name'
    }]

    async function appendToCSV(fields, res) {
      const json2csv = new Parser({ fields: fields })
      try {
        const csv = json2csv.parse(fields) + '\n';
        await fs.appendFileSync('liquidacao.csv', csv);
        res.redirect('/cadastro')
      } catch (error) {
        console.log('error:', error.message)
        res.status(500).send(error.message)
      }
    }

    await appendToCSV(fields, res);
  }

  if (req.body.tipo == 'MATERIAL PERMANENTE') {
    var situacao = 'DSP201';
    var contaEstoque = '123110801';
    function descrever(tipo, subitem, nf, formatteddataNf, opcao) {
      return new Promise(async (resolve, reject) => {
        let sql = 'select descricao from permanente where id=?';
        pool.query(sql, [subitem], function (error, resultado) {
          if (error) {
            return reject('Erro: ' + error.message)
          }
          var descricao = 'APROPRIACAO DE ' + tipo + ' - ' + [resultado[0].descricao] + '\nNF DATA/NR: ' + nf + ' ' + formatteddataNf + '\nEMPRESA ' + opcao
          console.log(descricao)
          return resolve(descricao)
        });
      });
    }

    let descricao = await descrever(tipo, subitem, nf, formatteddataNf, opcao)

    const fields = [{
      label: opcao,
      value: 'field1_name'
    }, {
      label: tipo,
      value: 'field2_name'
    }, {
      label: cnpj,
      value: 'field2_name'
    }, {
      label: favorecido,
      value: 'field1_name'
    }, {
      label: nf,
      value: 'field2_name'
    }, {
      label: valorBruto,
      value: 'field2_name'
    }, {
      label: formatteddataNf,
      value: 'field1_name'
    }, {
      label: formatteddataAt,
      value: 'field2_name'
    }, {
      label: formatteddataVenc,
      value: 'field2_name'
    }, {
      label: descricao,
      value: 'field1_name'
    }, {
      label: situacao,
      value: 'field2_name'
    }, {
      label: empenho,
      value: 'field2_name'
    }, {
      label: subitem,
      value: 'field1_name'
    }, {
      label: contaEstoque,
      value: 'field2_name'
    }, {
      label: contaApagar,
      value: 'field2_name'
    }, {
      label: situacao,
      value: 'field2_name'
    }, {
      label: siorg,
      value: 'field2_name'
    }, {
      label: mes1,
      value: 'field2_name'
    }, {
      label: codRecolhimento,
      value: 'field2_name'
    }, {
      label: codReceita,
      value: 'field2_name'
    }, {
      label: percentual,
      value: 'field2_name'
    }, {
      label: cc,
      value: 'field2_name'
    }, {
      label: ug,
      value: 'field2_name'
    }, {
      label: ano,
      value: 'field2_name'
    }]

    async function appendToCSV(fields, res) {
      const json2csv = new Parser({ fields: fields })
      try {
        const csv = json2csv.parse(fields) + '\n';
        await fs.appendFileSync('liquidacao.csv', csv);
        res.redirect('/cadastro')
      } catch (error) {
        console.log('error:', error.message)
        res.status(500).send(error.message)
      }
    }

    await appendToCSV(fields, res);
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
          console.log(descricao)
          return resolve(descricao)
        });
      });
    }

    let descricao = await descrever(tipo, subitem, nf, formatteddataNf, opcao)

    const fields = [{
      label: opcao,
      value: 'field1_name'
    }, {
      label: tipo,
      value: 'field2_name'
    }, {
      label: cnpj,
      value: 'field2_name'
    }, {
      label: favorecido,
      value: 'field1_name'
    }, {
      label: nf,
      value: 'field2_name'
    }, {
      label: valorBruto,
      value: 'field2_name'
    }, {
      label: formatteddataNf,
      value: 'field1_name'
    }, {
      label: formatteddataAt,
      value: 'field2_name'
    }, {
      label: formatteddataVenc,
      value: 'field2_name'
    }, {
      label: descricao,
      value: 'field1_name'
    }, {
      label: situacao,
      value: 'field2_name'
    }, {
      label: empenho,
      value: 'field2_name'
    }, {
      label: subitem,
      value: 'field1_name'
    }, {
      label: contaEstoque,
      value: 'field2_name'
    }, {
      label: contaApagar,
      value: 'field2_name'
    }, {
      label: situacao,
      value: 'field2_name'
    }, {
      label: siorg,
      value: 'field2_name'
    }, {
      label: mes1,
      value: 'field2_name'
    }, {
      label: codRecolhimento,
      value: 'field2_name'
    }, {
      label: codReceita,
      value: 'field2_name'
    }, {
      label: percentual,
      value: 'field2_name'
    }, {
      label: cc,
      value: 'field2_name'
    }, {
      label: ug,
      value: 'field2_name'
    }, {
      label: ano,
      value: 'field2_name'
    }]

    async function appendToCSV(fields, res) {
      const json2csv = new Parser({ fields: fields })
      try {
        const csv = json2csv.parse(fields) + '\n';
        await fs.appendFileSync('liquidacao.csv', csv);
        res.redirect('/cadastro')
      } catch (error) {
        console.log('error:', error.message)
        res.status(500).send(error.message)
      }
    }

    await appendToCSV(fields, res);


  }

  if (req.body.tipo == 'MATERIAL DE PNAE') {
    var contaEstoque = '115810301';
    function descrever(tipo, subitem, nf, formatteddataNf, opcao) {
      return new Promise(async (resolve, reject) => {
        let sql = 'select descricao from consumo where id=?';
        pool.query(sql, [subitem], function (error, resultado) {
          if (error) {
            return reject('Erro: ' + error.message)
          }
          var descricao = 'APROPRIACAO DE ' + tipo + ' - ' + 'MATERIAL DE ASSISTENCIA SOCIAL' + '\nNF DATA/NR: ' + nf + ' ' + formatteddataNf + '\nEMPRESA ' + opcao
          console.log(descricao)
          return resolve(descricao)
        });
      });
    }

    let descricao = await descrever(tipo, subitem, nf, formatteddataNf, opcao)

    const fields = [{
      label: opcao,
      value: 'field1_name'
    }, {
      label: tipo,
      value: 'field2_name'
    }, {
      label: cnpj,
      value: 'field2_name'
    }, {
      label: favorecido,
      value: 'field1_name'
    }, {
      label: nf,
      value: 'field2_name'
    }, {
      label: valorBruto,
      value: 'field2_name'
    }, {
      label: formatteddataNf,
      value: 'field1_name'
    }, {
      label: formatteddataAt,
      value: 'field2_name'
    }, {
      label: formatteddataVenc,
      value: 'field2_name'
    }, {
      label: descricao,
      value: 'field1_name'
    }, {
      label: situacao,
      value: 'field2_name'
    }, {
      label: empenho,
      value: 'field2_name'
    }, {
      label: subitem,
      value: 'field1_name'
    }, {
      label: contaEstoque,
      value: 'field2_name'
    }, {
      label: contaApagar,
      value: 'field2_name'
    }, {
      label: situacao,
      value: 'field2_name'
    }, {
      label: siorg,
      value: 'field2_name'
    }, {
      label: mes1,
      value: 'field2_name'
    }, {
      label: codRecolhimento,
      value: 'field2_name'
    }, {
      label: codReceita,
      value: 'field2_name'
    }, {
      label: percentual,
      value: 'field2_name'
    }, {
      label: cc,
      value: 'field2_name'
    }, {
      label: ug,
      value: 'field2_name'
    }, {
      label: ano,
      value: 'field2_name'
    }]

    async function appendToCSV(fields, res) {
      const json2csv = new Parser({ fields: fields })
      try {
        const csv = json2csv.parse(fields) + '\n';
        await fs.appendFileSync('liquidacao.csv', csv);
        res.redirect('/cadastro')
      } catch (error) {
        console.log('error:', error.message)
        res.status(500).send(error.message)
      }
    }

    await appendToCSV(fields, res);
  };

  if (req.body.tipo == 'MATERIAL DE COOPERATIVA (PNAE)') {
    var contaEstoque = '115810301';
    function descrever(tipo, subitem, nf, formatteddataNf, opcao) {
      return new Promise(async (resolve, reject) => {
        let sql = 'select descricao from servico where id=?';
        pool.query(sql, [subitem], function (error, resultado) {
          if (error) {
            return reject('Erro: ' + error.message)
          }
          var descricao = 'APROPRIACAO DE ' + tipo + ' - ' + 'MATERIAL DE ASSISTENCIA SOCIAL' + '\nNF DATA/NR: ' + nf + ' ' + formatteddataNf + '\nEMPRESA ' + opcao
          console.log(descricao)
          return resolve(descricao)
        });
      });
    }

    let descricao = await descrever(tipo, subitem, nf, formatteddataNf, opcao)

    const fields = [{
      label: opcao,
      value: 'field1_name'
    }, {
      label: tipo,
      value: 'field2_name'
    }, {
      label: cnpj,
      value: 'field2_name'
    }, {
      label: favorecido,
      value: 'field1_name'
    }, {
      label: nf,
      value: 'field2_name'
    }, {
      label: valorBruto,
      value: 'field2_name'
    }, {
      label: formatteddataNf,
      value: 'field1_name'
    }, {
      label: formatteddataAt,
      value: 'field2_name'
    }, {
      label: formatteddataVenc,
      value: 'field2_name'
    }, {
      label: descricao,
      value: 'field1_name'
    }, {
      label: situacao,
      value: 'field2_name'
    }, {
      label: empenho,
      value: 'field2_name'
    }, {
      label: subitem,
      value: 'field1_name'
    }, {
      label: contaEstoque,
      value: 'field2_name'
    }, {
      label: contaApagar,
      value: 'field2_name'
    }, {
      label: situacao,
      value: 'field2_name'
    }, {
      label: siorg,
      value: 'field2_name'
    }, {
      label: mes1,
      value: 'field2_name'
    }, {
      label: codRecolhimento,
      value: 'field2_name'
    }, {
      label: codReceita,
      value: 'field2_name'
    }, {
      label: percentual,
      value: 'field2_name'
    }, {
      label: cc,
      value: 'field2_name'
    }, {
      label: ug,
      value: 'field2_name'
    }, {
      label: ano,
      value: 'field2_name'
    }]

    async function appendToCSV(fields, res) {
      const json2csv = new Parser({ fields: fields })
      try {
        const csv = json2csv.parse(fields) + '\n';
        await fs.appendFileSync('liquidacao.csv', csv);
        res.redirect('/cadastro')
      } catch (error) {
        console.log('error:', error.message)
        res.status(500).send(error.message)
      }
    }

    await appendToCSV(fields, res);
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
          console.log(descricao)
          return resolve(descricao)
        });
      });
    }

    let descricao = await descrever(tipo, subitem, nf, formatteddataNf, opcao)

    const fields = [{
      label: opcao,
      value: 'field1_name'
    }, {
      label: tipo,
      value: 'field2_name'
    }, {
      label: cnpj,
      value: 'field2_name'
    }, {
      label: favorecido,
      value: 'field1_name'
    }, {
      label: nf,
      value: 'field2_name'
    }, {
      label: valorBruto,
      value: 'field2_name'
    }, {
      label: formatteddataNf,
      value: 'field1_name'
    }, {
      label: formatteddataAt,
      value: 'field2_name'
    }, {
      label: formatteddataVenc,
      value: 'field2_name'
    }, {
      label: descricao,
      value: 'field1_name'
    }, {
      label: situacao,
      value: 'field2_name'
    }, {
      label: empenho,
      value: 'field2_name'
    }, {
      label: subitem,
      value: 'field1_name'
    }, {
      label: contaEstoque,
      value: 'field2_name'
    }, {
      label: contaApagar,
      value: 'field2_name'
    }, {
      label: situacao,
      value: 'field2_name'
    }, {
      label: siorg,
      value: 'field2_name'
    }, {
      label: mes1,
      value: 'field2_name'
    }, {
      label: codRecolhimento,
      value: 'field2_name'
    }, {
      label: codReceita,
      value: 'field2_name'
    }, {
      label: percentual,
      value: 'field2_name'
    }, {
      label: cc,
      value: 'field2_name'
    }, {
      label: ug,
      value: 'field2_name'
    }, {
      label: ano,
      value: 'field2_name'
    }]

    async function appendToCSV(fields, res) {
      const json2csv = new Parser({ fields: fields })
      try {
        const csv = json2csv.parse(fields) + '\n';
        await fs.appendFileSync('liquidacao.csv', csv);
        res.redirect('/cadastro')
      } catch (error) {
        console.log('error:', error.message)
        res.status(500).send(error.message)
      }
    }

    await appendToCSV(fields, res);
  }
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
