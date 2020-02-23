const { Router } = require('express');
const axios = require('axios');
const oauth = require("./oauth");
const request = require("request");
const routes = Router();
const Usuario = require('./models/Usuario');

routes.post("/cadastro", async function (req, res) {
  const { usuario, senha } = req.body;

  const usuarioExiste = await Usuario.findOne({ usuario });

  if (usuarioExiste)
    res.status(401).json({ error: "Este usuário não está disponível!" });

  const novoUsuario = await Usuario.create({
    usuario,
    senha
  });

  return res.json(novoUsuario);
});
routes.post("/login", async function (req, res) {
  const { usuario, senha } = req.body;

  const usuarioExiste = await Usuario.findOne({ usuario, senha });

  if (usuarioExiste)
    return res.json(usuarioExiste);
  else
    return res.status(404).json({ error: "Usuário não localizado ou senha incorreta!" });
});
// Busca os dados do usuário
routes.get("/usuario/:_id", async function (req, res) {
  const { _id } = req.params;
  const usuario = await Usuario.findById(_id);

  if (!usuario)
    return res.status(404).json({ error: "Usuário não localizado!" });

  return res.json(usuario);
})

routes.get("/twitter-login", async function (req, res) {
  const request_data = {
    url: 'https://api.twitter.com/oauth/request_token',
    method: 'POST',
    data: {
      oauth_callback: "http://localhost:3333/callback"
    }
  }

  // Cookie para o usuário que fez a solicitação
  res.cookie("_id", req.query._id);

  request(
    {
      url: request_data.url,
      method: request_data.method,
      form: oauth.authorize(request_data)
    }, function (error, response, body) {
      if (error)
        return res.send("Erro! " + error);
      const oauth_token = body.split("&")[0].split("=")[1];
      return res.redirect(`https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`);
    }
  );
});

routes.get('/callback', async function (req, res) {
  let { oauth_token, oauth_verifier } = req.query;
  const { _id } = req.cookies;

  try {
    let response = await axios.post("https://api.twitter.com/oauth/access_token", null, {
      params: {
        oauth_token,
        oauth_verifier
      }
    });

    response = response.data.split("&");
    oauth_token = response[0].split("=")[1];
    let oauth_token_secret = response[1].split("=")[1];
    let user_id = response[2].split("=")[1];
    let screen_name = response[3].split("=")[1];

    // Insere os dados do usuário no Mongo
    let usuario = await Usuario.findOne({ _id });

    // Adiciona os dados novos
    usuario.oauth_token = oauth_token;
    usuario.oauth_token_secret = oauth_token_secret;
    usuario.user_id = user_id;
    usuario.screen_name = screen_name;

    // Update no banco
    await usuario.save();

    // Fecha a aba de autenticação
    res.send("<script>window.close()</script>");
  } catch (e) {
    return res.json({
      "error": e.response.data
    })
  }
});

routes.get("/timeline", async function (req, res) {
  const { _id } = req.cookies;

  // Usuário não está logado
  if (!_id)
    return res.redirect("/twitter-login");

  const { oauth_token, oauth_token_secret } = await Usuario.findOne({ _id });

  // Busca a Timeline
  let request_data = {
    url: "https://api.twitter.com/1.1/statuses/home_timeline.json",
    method: "GET",
    data: {}
  }
  const tokens = {
    key: oauth_token,
    secret: oauth_token_secret
  }
  request(
    {
      url: request_data.url,
      method: request_data.method,
      form: request_data.data,
      headers: oauth.toHeader(oauth.authorize(request_data, tokens))
    },
    function (error, response, body) {
      if (body)
        res.send(body);
      else
        res.send("Error!");
    }
  );
});

module.exports = routes;