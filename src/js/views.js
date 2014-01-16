var FilerOptionView = Backbone.View.extend({
    tagName: 'div',

    template: _.template(
        '<option value="<%= report_id %>"><%= display_name %> (<%= party %>) - <%= race %></option>'
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
// new BucketsView({model: activeFiler});
