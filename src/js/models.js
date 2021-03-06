var Filer = Backbone.Model.extend({});

var Meta = Backbone.Model.extend({
    initialize: function() {
        this.convert_for_display('total_contributions');
        this.convert_for_display('total_expenditures');
        this.convert_for_display('cash_on_hand');
        this.convert_for_display('outstanding_loans');
    },

    convert_for_display: function(key) {
        this.set(key, commas(parseFloat(this.get(key)).toFixed(0)));
    }
});

var Measurement = Backbone.Model.extend({
    initialize: function() {
        this.set('amt', commas(parseFloat(this.get('amt')).toFixed(0)));
    }
});

var ContributionByState = Measurement.extend({});
var ContributionByDate = Measurement.extend({});
var ContributionByZip = Measurement.extend({});
var TopDonor = Measurement.extend({});

var Bucket = Backbone.Model.extend({
    formalBucketNames: {
       'less_5k': 'Less than $5,000',
       '5k_10k': '$5,000 to $10,000',
       '10k_20k': '$10,000 to $20,000',
       '20k_50k': '$20,000 to $50,000',
       '50k_100k': '$50,000 to $100,000',
       'more_100k': 'More than $100,000'
    },

    initialize: function() {
        this.set('amt_display', commas(parseFloat(this.get('amt')).toFixed(0)));
        this.set('name_display', this.formalBucketNames[this.get('name')]);
        this.set('percent_of_total', this.get_percent_of_total());
    },

    get_percent_of_total: function() {
        return ((parseFloat(this.get('amt')) / parseFloat(this.get('total_contributions'))) * 100).toFixed(1);
    }
});

var ActiveFiler = Backbone.Model.extend({
    urlRoot: '//tx-tecreports.herokuapp.com/api/v1/report/',

    url: function() {
        var base = _.result(this, 'urlRoot');
        return base + encodeURIComponent(this.id) + '/?callback=?';
    },

    parse: function(response) {
        _.each(response.buckets, function(b) {
            b.total_contributions = response._meta.total_contributions;
        });

        response._meta = new Meta(response._meta);
        response.contribs_by_state = new StateContributions(response.contribs_by_state);
        // response.top_contribs_by_zip = new ZipContributions(response.top_contribs_by_zip);
        response.contribs_by_date = new DateContributions(response.contribs_by_date);
        response.top_ten_donations = new TopDonors(response.top_ten_donations);
        response.buckets = new Buckets(response.buckets);

        return response;
    },

    fetchFiler: function(new_id) {
        this.set({id: new_id}, {silent: true});
        this.fetch();
    }
});

var activeFiler = new ActiveFiler();
