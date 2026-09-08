Pantheon Apache Solr
====================

[Apache Solr](http://lucene.apache.org/solr/) is a system that exposes APIs for indexing and searching site content. Pantheon provides a regular Solr v3.x server for each environment as a service.

Installation
------------

For each Pantheon environment (dev, test and live), post the desired schema.xml to the Apache Solr server using the [post schema](admin/config/search/pantheon/schema) interface. Step-by-step instructions can be found in [Apache Solr on Pantheon](https://www.getpantheon.com/docs/articles/sites/apache-solr/).

Compatibility
-------------

The pantheon_apachesolr module was optimized for use with [Search API Solr search v7.x-1.2](https://drupal.org/project/search_api_solr).

Prior and development versions are not supported or recommended. Future versions should work; if you encounter a problem with a newer official release, please notify Pantheon Support.

Vocabulary
----------

* bias
  Allows certain parts of indexed items to influence the importance of search results. The higher the bias, the greater the influence; the range is 0.1 to 21.0.
* core
  A core is a separate configuration and index using a single Solr instance. A core is created when the schema is posted. For more information, see <http://wiki.apache.org/solr/CoreAdmin>.
* document
  A document is similar to a database row, containing the contents of what is to be searched and whatever fields are associated with it, like title
* facet
  Search facets allow search results to be filtered; examples include seeing a list of potential filters and the count of matches for each filter on the left, like Amazon product searches.
* index
  structure containing extracted keywords from a document for rapid search and retrieval, similar to a database table.
* score
  calculated relevance of matches influenced by bias, represented as a float.
* schema.xml
  Contains details about the fields that documents can contain, and how those fields are handled when adding documents to the index or querying those fields. Must be posted using the pantheon_apachesolr module before indexing and searching will work. For more information, see <http://wiki.apache.org/solr/SchemaXml>.

Known Limitations
-----------------

* Anything that takes more than 5 seconds to send to to the Solr server be indexed will timeout, which will block indexing. For example, large documents attached to Drupal nodes. In these cases, the developer must work with the content or code to exempt the nodes and/or files from being indexed.
* solrconfig.xml and synonyms.txt cannot be modified.
