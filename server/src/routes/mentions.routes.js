import express from 'express';

const router = new express.Router();

const getMentionContext = (mention) => {
  if (mention?.highlight?.context) {
    return mention.highlight.context;
  }
  try {
    return decodeURIComponent(escape(mention._source.context));
  } catch (_) {
    return mention._source.context;
  }
};

const getMentionsQuery = ({ options }) => {
  const {
    from, search, size, sortBy, sortOrder, type,
  } = options;
  let types = [];
  if (type === 'software') {
    types = ['software'];
  } else if (type === 'datasets') {
    types = ['dataset-implicit', 'dataset-name'];
  }
  const body = {
    from,
    size,
    query: {
      bool: {
        must: [
          {
            terms: {
              'type.keyword': types,
            },
          },
        ],
      },
    },
    _source: [
      'authors',
      'affiliations',
      'context',
      'dataset-name',
      'doi',
      'mention_context',
      'rawForm',
      'software-name',
      'type',
    ],
    highlight: {
      number_of_fragments: 0,
      fragment_size: 100,
      require_field_match: 'true',
      fields: [
        {
          context: { pre_tags: ['<b>'], post_tags: ['</b>'] },
        },
      ],
    },
  };
  if (search?.length > 0) {
    body.query.bool.must.push({ simple_query_string: { query: search } });
  }
  if (sortBy && sortOrder) {
    let sortFields = sortBy;
    switch (sortBy) {
      case 'doi':
        sortFields = ['doi.keyword'];
        break;
      case 'rawForm':
        sortFields = [
          'dataset-name.rawForm.keyword',
          'software-name.rawForm.keyword',
        ];
        break;
      case 'mention.mention_context.used':
        sortFields = ['mention_context.used'];
        break;
      case 'mention.mention_context.created':
        sortFields = ['mention_context.created'];
        break;
      case 'mention.mention_context.shared':
        sortFields = ['mention_context.shared'];
        break;
      default:
        console.error(`This "sortBy" field is not mapped : ${sortBy}`);
    }
    body.sort = [];
    sortFields.map((sortField) => body.sort.push({ [sortField]: sortOrder }));
  }
  return body;
};

const getMentions = async ({ query }) => {
  const url = `${process.env.ES_URL}/${process.env.ES_INDEX_MENTIONS}/_search`;
  const params = {
    body: JSON.stringify(query),
    method: 'POST',
    headers: {
      Authorization: process.env.ES_AUTH,
      'content-type': 'application/json',
    },
  };
  const response = await fetch(url, params);
  const data = await response.json();
  const mentions = (data?.hits?.hits ?? []).map((mention) => ({
    ...mention._source,
    affiliations: [
      ...new Set(
        mention._source?.affiliations
          ?.map((_affiliation) => _affiliation.name)
          .flat()
          .filter((item) => !!item) ?? [],
      ),
    ],
    authors:
      mention._source?.authors
        ?.map((_author) => _author.full_name)
        .filter((_author) => !!_author) ?? [],
    context: getMentionContext(mention),
    id: mention._id,
    mention_context_original: mention._source.mention_context,
    rawForm:
      mention._source?.['software-name']?.rawForm
      ?? mention._source?.['dataset-name']?.rawForm,
    type: mention._source?.type === 'software' ? 'software' : 'dataset',
    type_original:
      mention._source?.type === 'software' ? 'software' : 'dataset',
  }));
  return mentions;
};

const getMentionsCount = async ({ query }) => {
  ['_source', 'from', 'highlight', 'size'].forEach((item) => {
    // eslint-disable-next-line no-param-reassign
    delete query?.[item];
  });
  const url = `${process.env.ES_URL}/${process.env.ES_INDEX_MENTIONS}/_count`;
  const params = {
    body: JSON.stringify(query),
    method: 'POST',
    headers: {
      Authorization: process.env.ES_AUTH,
      'content-type': 'application/json',
    },
  };
  const response = await fetch(url, params);
  const data = await response.json();
  return data?.count ?? 0;
};

router.route('/mentions').post(async (req, res) => {
  try {
    const options = req?.body ?? {};
    if (!['datasets', 'software'].includes(options?.type)) {
      res
        .status(400)
        .json({ message: 'Type should be either "datasets" or "software".' });
    } else {
      const query = getMentionsQuery({ options });
      const mentions = await getMentions({ query });
      const count = await getMentionsCount({ query });
      res.status(200).json({ count, mentions });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

export default router;
