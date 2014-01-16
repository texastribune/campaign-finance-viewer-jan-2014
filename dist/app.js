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
        response.top_contribs_by_zip = new ZipContributions(response.top_contribs_by_zip);
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

var Filers = Backbone.Collection.extend({
    model: Filer,
    url: 'data/filers.json',

    comparator: 'filer_name'
});

var filers = new Filers();

var StateContributions = Backbone.Collection.extend({
    model: ContributionByState,

    comparator: '-amt'
});

var DateContributions = Backbone.Collection.extend({
    model: ContributionByDate
});

var ZipContributions = Backbone.Collection.extend({
    model: ContributionByZip,

    comparator: '-amt'
});

var TopDonors = Backbone.Collection.extend({
    model: TopDonor,

    comparator: '-amt'
});

var Buckets = Backbone.Collection.extend({
    model: Bucket
});

var FilerOptionView = Backbone.View.extend({
    tagName: 'div',

    template: _.template(
        '<option value="<%= report_id %>"><%= display_name %> (<%= party %>) - <%= race %> <%= type %></option>'
    ),

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

var FilerSelectView = Backbone.View.extend({
    el: '#filer-select-view',

    events: {
        'change': 'triggerLoad'
    },

    initialize: function(obj) {
        this.activeFiler = obj.activeFiler;

        this.listenTo(this.collection, 'reset', this.render);
    },

    render: function() {
        var combined = [];

        this.collection.each(function(model) {
            var view = new FilerOptionView({model: model});
            combined.push(view.render().el.childNodes[0]);
        });

        this.$el.append(combined);
    },

    triggerLoad: function() {
        var val = this.$el.val();
        this.activeFiler.fetchFiler(val);
    }
});

var MetaView = Backbone.View.extend({
    el: '#meta-view',

    template: _.template($('#meta-view-template').html()),

    initialize: function() {
        this.listenTo(this.model, 'change:_meta', this.render);
    },

    render: function() {
        this.$el.html(this.template(this.model.get('_meta').toJSON()));
        return this;
    }
});

var StateContributionsView = Backbone.View.extend({
    el: '#state-contributions-view',

    template: _.template($('#state-contributions-view-template').html()),

    initialize: function() {
        this.listenTo(this.model, 'change:contribs_by_state', this.render);
    },

    render: function() {
        var self = this;
        var combined = '';

        this.model.get('contribs_by_state').each(function(m) {
            combined += self.template(m.toJSON());
        });

        this.$el.html(combined);
    }
});

var ZipContributionsView = Backbone.View.extend({
    el: '#zip-contributions-view',

    template: _.template($('#zip-contributions-view-template').html()),

    initialize: function() {
        this.listenTo(this.model, 'change:top_contribs_by_zip', this.render);
    },

    render: function() {
        var self = this;
        var combined = '';

        this.model.get('top_contribs_by_zip').each(function(m) {
            combined += self.template(m.toJSON());
        });

        this.$el.html(combined);
    }
});

var DateContributionsView = Backbone.View.extend({
    el: '#date-contributions-view',

    template: _.template($('#date-contributions-view-template').html()),

    initialize: function() {
        this.listenTo(this.model, 'change:contribs_by_date', this.render);
    },

    render: function() {
        var self = this;
        var combined = '';

        this.model.get('contribs_by_date').each(function(m) {
            combined += self.template(m.toJSON());
        });

        this.$el.html(combined);
    }
});

var TopDonorsView = Backbone.View.extend({
    el: '#top-donors-view',

    template: _.template($('#top-donors-view-template').html()),

    initialize: function() {
        this.listenTo(this.model, 'change:top_ten_donations', this.render);
    },

    render: function() {
        var self = this;
        var combined = '';

        this.model.get('top_ten_donations').each(function(m) {
            combined += self.template(m.toJSON());
        });

        this.$el.html(combined);
    }
});

var BucketsView = Backbone.View.extend({
    el: '#bucket-contributions-view',

    template: _.template($('#contrib-buckets-view-template').html()),

    initialize: function() {
        this.listenTo(this.model, 'change:buckets', this.render);
    },

    render: function() {
        var self = this;
        var combined = '';

        this.model.get('buckets').each(function(m) {
            combined += self.template(m.toJSON());
        });

        this.$el.html(combined);
    }
});

new FilerSelectView({
    collection: filers,
    activeFiler: activeFiler
});

new MetaView({model: activeFiler});
new StateContributionsView({model: activeFiler});
new ZipContributionsView({model: activeFiler});
new DateContributionsView({model: activeFiler});
new TopDonorsView({model: activeFiler});
new BucketsView({model: activeFiler});

filers.fetch({reset: true});

function commas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
