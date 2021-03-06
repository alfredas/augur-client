var _ = require('lodash');
var secureRandom = require('secure-random');

var constants = require('../libs/constants');


var bytesToHex = function (bytes) {
  return '0x' + _.reduce(bytes, function (hexString, byte) {
    return hexString + byte.toString(16);
  }, '');
};

var ReportActions = {
  storeReports: function (reports) {
    // TODO: Encrypt the reports so malware can't access them and steal
    // reputation.
    localStorage.setItem(constants.report.REPORTS_STORAGE, JSON.stringify(reports));
  },

  /**
   * Broadcast the hash of the report and store the report and salt.
   */
  hashReport: function (branchId, votePeriod, decisions) {
    var saltBytes = secureRandom(32);
    var salt = bytesToHex(saltBytes);

    var pendingReports = this.flux.store('branch').getState().pendingReports;
    pendingReports.push({
      branchId,
      votePeriod,
      decisions,
      salt,
      reported: false
    });
    this.flux.actions.report.storeReports(pendingReports);

    // Hash the report and submit it to the network.
    var ethereumClient = this.flux.store('config').getEthereumClient();
    var hash = Augur.hashReport(decisions, salt);
    console.log('Submitting hash for period', votePeriod, 'reports:', hash);
    var log = x => console.log('Augur.submitReportHash callback:', x);
    Augur.submitReportHash(branchId, hash, votePeriod, log, log, log);

    this.dispatch(constants.branch.UPDATE_PENDING_REPORTS, {pendingReports});
  },

  /**
   * Submit the actual report data.
   *
   * @param report {Object} branchId, votePeriod, decisions and salt.
   */
  submitReport: function (report) {
    var log = x => console.log('Augur.report callback:', x);
    var returned = Augur.report(report.branchId, report.decisions, report.votePeriod, report.salt, log, log, log);
    console.log('Augur.report returned:', returned);
  },

  /**
   * Submit any reports that haven't been submitted and are in the last half of
   * their reporting period.
   */
  submitQualifiedReports: function () {
    let currentBlock = this.flux.store('network').getState().blockNumber;
    let ethereumClient = this.flux.store('config').getEthereumClient();
    let reports = this.flux.store('branch').getState().pendingReports;
    let unsentReports = _.filter(reports, r => !r.reported);
    let didSendReports = false;

    _.forEach(unsentReports, (report) => {
      let periodLength = ethereumClient.getPeriodLength(report.branchId);
      let reportingStartBlock = (report.votePeriod + 1) * periodLength;
      let reportingCurrentBlock = currentBlock - reportingStartBlock;
      let shouldSend = reportingCurrentBlock > (periodLength / 2);

      if (shouldSend) {
        console.log('Sending report for period', report.votePeriod);
        this.flux.actions.report.submitReport(report);
        report.reported = true;
        didSendReports = true;
      }
    });

    if (didSendReports) {
      // Update localStorage and the stores with the mutated reports array.
      this.flux.actions.report.storeReports(reports);
      this.dispatch(constants.branch.LOAD_PENDING_REPORTS_SUCCESS, {pendingReports: reports});
    }
  },

  loadPendingReports: function () {
    var reportsString = localStorage.getItem(constants.report.REPORTS_STORAGE);
    var pendingReports = reportsString ? JSON.parse(reportsString) : [];
    this.dispatch(constants.branch.LOAD_PENDING_REPORTS_SUCCESS, {pendingReports});
  },
};

module.exports = ReportActions;
