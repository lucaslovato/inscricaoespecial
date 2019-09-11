import * as SocketIO from "socket.io";
import * as Express from "express";
import * as Path from "path";
import * as HTTP from "http";
import * as HTTPS from "https";
import * as CORS from "cors";
import * as RedirectHttps from "redirect-https";
import * as BodyParser from "body-parser";
import {Barrier} from "./authentication/Barrier";
import {InitRestful} from "./restful";
import {Source} from "./events/Source";
import {Database} from "./db/Database";
import {OpenRTC} from "./rtc/OpenRTC";
import {Greenlock} from "./util/Greenlock";
import {Router} from "express";
import {Cron} from "./rotinas/Cron";

const zip = require('express-easy-zip');
const j2x = require('json2xls');

export class Application extends Source {
  private cron: Cron;
  private _mainPort: any;
  private _dataBase: any;
  private _server: any;
  private _router: any;
  private static _config: any;
  private _app: any;
  private _io: any;

  constructor(pathConfig) {
    super();
    Application.config = pathConfig;
    this.app = Express;
    this.server = this.initServer();
    this.serverConfiguration();
    this.io = this.initIO();
    this.router = Router;
    this.server.listen(this.mainPort, this.initDataBase.bind(this));
    this.app.use(j2x.middleware);
    this.app.use(zip());
  }

  private set mainPort(port) {
    this._mainPort = port;
  }

  private get mainPort() {
    return this._mainPort;
  }

  private set dataBase(dataBase) {
    this._dataBase = new dataBase(Application.config.db);
  }

  private get dataBase() {
    return this._dataBase;
  }

  private set server(server) {
    this._server = server;
  }

  private get server() {
    return this._server;
  }

  private set router(router) {
    this._router = new router();
  }

  private get router() {
    return this._router;
  }

  private static set config(pathConfig) {
    Application._config = require(pathConfig);
  }

  private static get config() {
    return Application._config;
  }

  private set app(express) {
    this._app = express();
  }

  private get app() {
    return this._app;
  }

  private set io(io) {
    this._io = io;
  }

  private get io() {
    return this._io;
  }

  /**
   * Liga os eventos que o application precisa ouvir.
   */
  private wiring() {
    this.hub    .on('error.**', this.initError.bind(this));
    this.hub.on('database.ready', this.dataBaseReady.bind(this));
    this.hub.on('restful.ready', this.serverOk.bind(this));
  }

  private initError(error) {
    return console.error(`Something is wrong ${error}`);
  }

  /**
   * É executada assim que o server fica pronto para atender.
   */
  private serverOk() {
    this.app.use('/api', this.router);
    this.hub.send(this, 'app.ready', {success: null, error: null});
    console.log(`APP PRONTO. BORA DALHEEE ${Application.config.server.port}`);
  }

  /**
   * Inicia o Banco de Dados.
   */
  private initDataBase() {
    this.wiring();
    this.dataBase = Database;
  }

  /**
   * Inicia a rota dos restful.
   */
  private dataBaseReady() {
    new InitRestful(this.router);
    this.cron = new Cron();
  }

  /**
   * Inicia as configurações do server.
   */
  private serverConfiguration() {
    let barrier = new Barrier();
    this.app.set('view engine', 'ejs');
    this.app.set('views', Path.resolve(__dirname + '/views'));
    Barrier.setStatics(this.app);
    this.app.use(CORS());
    this.app.use(barrier.validateKey.bind(barrier));
    this.app.use(BodyParser.urlencoded({extended: true}));
    this.app.use(BodyParser.json({limit: '5mb'}));
    this.app.use('/favicon.ico', Express.static(Path.resolve(Application.config.images.favicon)));
  }

  /**
   *
   * @returns {any}
   *
   * Inicia o websocket.
   */
  private initIO() {
    let io = SocketIO(this.server);
    io.on('connection', this.connection.bind(this));
    return io;
  }

  /**
   *
   * @returns {any}
   *
   * Inicia o server, se no config estiver que é um https, ele inicia com chave.
   * Caso contrario, ele inicia apenas em http.
   */
  private initServer() {
    if (Application.config.server.https) {
      this.mainPort = Application.config.server.httpsPort;
      let greenlock = new Greenlock();
      HTTP.createServer(greenlock.lex.middleware(RedirectHttps())).listen(Application.config.server.port);
      return HTTPS.createServer(greenlock.lex.httpsOptions, greenlock.lex.middleware(this.app));
    } else {
      this.mainPort = Application.config.server.port;
      return HTTP.createServer(this.app);
    }
  }

  /**
   *
   * @param socket
   *
   * Inicia a conexão via RTC com o cliente.
   */
  private connection(socket) {
    new OpenRTC({socket: socket});
  }

  public async destroy() {
    return await this.dataBase.destroy();
  }

  public static getPathI18N() {
    return Application.config.directories.i18n;
  }

}