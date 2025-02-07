const getMentionsCorrections = (mentions) => mentions
  .filter((mention) => mention.hasCorrection)
  .map((mention) => {
    const corrections = [];
    if (mention.type !== mention.type_original) {
      corrections.push({
        id: mention.id,
        doi: mention.doi,
        text: mention.context,
        type: mention.type,
        previousType: mention.type_original,
      });
    }
    if (
      mention.mention_context.used
          !== mention.mention_context_original.used
        || mention.mention_context.created
          !== mention.mention_context_original.created
        || mention.mention_context.shared
          !== mention.mention_context_original.shared
    ) {
      corrections.push({
        id: mention.id,
        doi: mention.doi,
        texts: [
          {
            text: mention.context,
            class_attributes: {
              classification: {
                used: {
                  previousValue: mention.mention_context_original.used,
                  score: 1.0,
                  value: mention.mention_context.used,
                },
                created: {
                  previousValue: mention.mention_context_original.created,
                  score: 1.0,
                  value: mention.mention_context.created,
                },
                shared: {
                  previousValue: mention.mention_context_original.shared,
                  score: 1.0,
                  value: mention.mention_context.shared,
                },
              },
            },
          },
        ],
      });
    }
    return corrections;
  })
  .flat();

export { getMentionsCorrections };
