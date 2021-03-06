var React = require("react");
var Fluxxor = require("fluxxor");

var Router = require("react-router");
var RouteHandler = Router.RouteHandler;
var Link = Router.Link;
var Route = Router.Route;

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var ReactBootstrap = require('react-bootstrap');
var ProgressBar = ReactBootstrap.ProgressBar;
var OverlayMixin = require('react-bootstrap/lib/OverlayMixin');
var Modal = ReactBootstrap.Modal;

var constants = require('../libs/constants');

var Period = require('./Period');
var Network = require('./Network');
var Alert = require('./Alert');
var Confirm = require('./Confirm');

var AugurApp = React.createClass({

  mixins: [FluxMixin, StoreWatchMixin('branch', 'asset', 'network', 'config')],

  getInitialState: function () {
    return {
      status: 'stopped'
    };
  },

  getStateFromFlux: function () {

    var flux = this.getFlux();
    var percentLoaded = flux.store('config').getState().percentLoaded;

    // set app status (stopped, loading, running) from network & config state
    if (parseInt(percentLoaded) === 100) {
      this.setState({status: 'running'});
    }

    return {
      network: flux.store('network').getState(),
      branch: flux.store('branch').getState(),
      asset: flux.store('asset').getState(),
      market: flux.store('market').getState(),
      config: flux.store('config').getState()
    }
  },

  componentDidMount: function() {

    this.setState({status: 'stopped'});
    //console.log('initializing');

    // Initialize the EthereumClient and load the current Augur data.
    this.getFlux().actions.config.initializeState();

    //console.log('initialized');
  },

  getLoadingProgress: function() {

    var loadingProgress = <span />;

    if (this.state.config.percentLoaded) {

      loadingProgress = (
        <ProgressBar now={ parseFloat(this.state.config.percentLoaded) } className='loading-progress' />
      );
    }

    return loadingProgress
  },

  render: function() {

    //console.log('rendering', this.state.status);

    var cashBalance = this.state.asset.cash ? +this.state.asset.cash.toFixed(2) : '-';

    return (
      <div id="app" className={ this.state.status }>
        <nav className="navbar" role="navigation">
          <div className="container">
              <div className="navbar-header">
                  <h1 className="navbar-brand">augur<i>𝛂</i></h1>
              </div>
              <ul className="nav navbar-nav navbar-right">
                  <li>
                      <div>CASH: <b className="cash-balance">{ cashBalance }</b></div>
                  </li>
                  <li className="dropdown visible-xs visible-sm hidden-md">
                      <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">
                          <i className="fa fa-navicon"></i>
                          <span className="caret"></span>
                      </a>
                      <ul className="dropdown-menu" role="menu">
                          <li><Link to="home">Markets</Link></li>
                          <li><Link to="account">Account</Link></li>
                          <li><Link to="ballots">Ballot</Link></li>
                          <li><a className="disabled">Contacts</a></li>
                      </ul>
                  </li>
              </ul>
          </div>
        </nav>

        <section id="main" className="container">
          <div className="dash page row">
            <div className="col-md-3 hidden-xs hidden-sm sidebar">
              <div className="side-nav">
                  <p><Link to="home">Markets</Link><i>{ _.keys(this.state.market.markets).length }</i></p>
                  <p><Link to="account">Account</Link></p>
                  <p><Link to="ballots">Ballot</Link><i>{ this.state.branch.eventsToReport.length }</i></p>
                  <p><a className="disabled">Contacts</a></p>
              </div>

              <Network />
            </div>

            <div className="col-sm-12 col-md-9">

              <div id="period"></div>

              <RouteHandler {...this.props} branch={ this.state.branch } market={ this.state.market } />

            </div>
          </div>

        </section>

        <footer>
          <div className="row container clearfix"></div>
        </footer>

        <ErrorModal network={ this.state.network } config={ this.state.config } />

        <section id="loading" className="container">
          <div className="logo">
            { this.getLoadingProgress() }
          </div>
        </section>

      </div>
    );
  }
});

// modal prompt for loading exceptions
var ErrorModal = React.createClass({
  mixins: [FluxMixin, OverlayMixin],

  getInitialState: function () {

    return {
      isModalOpen: false
    }
  },

  componentWillReceiveProps: function(nextProps) {

    if (nextProps.network.ethereumStatus === constants.network.ETHEREUM_STATUS_FAILED ||
    nextProps.config.ethereumClientFailed === true) {
      this.setState({ isModalOpen: true });
    } else {
      this.setState({ isModalOpen: false });
    }
  },

  handleToggle: function() {

    this.setState({
      isModalOpen: !this.state.isModalOpen
    });
  },

  startDemoMode: function (event) {

    this.handleToggle();
    // start ethereum client demo mode
  },

  render: function() {
    return <span />;
  },

  renderOverlay: function () {

    if (!this.state.isModalOpen) return <span />;

    if (this.props.config.ethereumClientFailed) {

      // augur client failed to load
      return (
        <Modal {...this.props} bsSize='small' onRequestHide={ this.handleToggle } backdrop='static'>
          <div className="modal-body clearfix">
              <h4>Augur failed to load</h4>
              <p>There was a problem loading Augur</p>
              <p>Visit our help page for assitance contact us directly</p>
              <p style={{display: 'none'}}><a className="pull-right start-demo-mode" onClick={ this.startDemoMode } href="javascript:void(0)">Proceed in demo mode</a></p>
          </div>
        </Modal>
      );

    } else if (this.props.network.ethereumStatus === constants.network.ETHEREUM_STATUS_FAILED) {

      var host = window.location.origin;

      // no ethereum client detected
      return (
        <Modal {...this.props} id="no-eth-modal" onRequestHide={ this.handleToggle } backdrop='static'>
          <div className="modal-body clearfix">
              <h4>Failed to connect to Ethereum</h4>
              <p>Augur requires a local node of the Ethereum client running</p>
              <p>Visit <a href="https://github.com/ethereum/go-ethereum/wiki">the ethereum github wiki</a> for help installing the latest client</p>
              <p>If geth is installed:<br /><span className='cmd'>geth --rpc --rpccorsdomain { host }  --shh --unlock primary</span></p>
              <p style={{display: 'none'}}><a className="pull-right start-demo-mode" onClick={ this.startDemoMode } href="javascript:void(0)">Proceed in demo mode</a></p>
          </div>
        </Modal>
      );
    }
  }
});

module.exports = AugurApp;
