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
