import { Button, Link } from "@dataesr/dsfr-plus";
import React from "react";

const LimitedList = ({ list, max }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const limitedList = isExpanded ? list : list.slice(0, max);

  if (list.length <= max) {
    return (
      <ul>
        {list.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <ul>
        {limitedList.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? "Show less" : `Show ${list.length - max} more`}
      </button>
    </>
  );
};

function CheckIcon({ checked }) {
  return checked ? (
    <span className="fr-icon-checkbox-line" aria-hidden="true" />
  ) : (
    <span className="fr-icon-close-circle-line" aria-hidden="true" />
  );
}

function SortButton({ label, searchParams, setSearchParams, sortBy }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Button
        className="fr-ml-1v"
        color="beige-gris-galet"
        onClick={() => {
          if (searchParams.get('sort-by') !== sortBy) {
            searchParams.set('sort-order', 'asc');
          } else {
            searchParams.set('sort-order', searchParams.get('sort-order') === 'asc' ? 'desc' : 'asc')
          }
          searchParams.set('sort-by', sortBy);
          setSearchParams(searchParams);
        }}
        size="sm"
        variant="text"
      >
        {label}
        {searchParams.get('sort-by') === sortBy && searchParams.get('sort-order') === 'asc' && <>▲</>}
        {searchParams.get('sort-by') === sortBy && searchParams.get('sort-order') === 'desc' && <>▼</>}
      </Button>
    </div>
  );
}

export default function MentionsList({ mentions, searchParams, setSearchParams }) {
  return (
    <table className="mentions-list">
      <thead>
        <tr>
          <th>
            <SortButton
              label="DOI"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              sortBy="doi"
            />
          </th>
          <th>
            <SortButton
              label="Raw form"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              sortBy="rawForm"
            />
          </th>
          <th>Context</th>
          <th
            style={{ writingMode: "vertical-rl", transform: "rotate(210deg)" }}
          >
            <SortButton
              label="Used"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              sortBy="mention.mention_context.used"
            />
          </th>
          <th
            style={{ writingMode: "vertical-rl", transform: "rotate(210deg)" }}
          >
            <SortButton
              label="Created"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              sortBy="mention.mention_context.created"
            />
          </th>
          <th
            style={{ writingMode: "vertical-rl", transform: "rotate(210deg)" }}
          >
            <SortButton
              label="Shared"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              sortBy="mention.mention_context.shared"
            />
          </th>
          <th>Affiliations</th>
          <th>Authors</th>
        </tr>
      </thead>
      <tbody>
        {mentions.map((mention) => (
          <tr key={mention.id} className="mention">
            <td>
              <Link
                href={`https://doi.org/${mention.doi}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {mention.doi}
              </Link>
            </td>
            <td>{mention.rawForm}</td>
            <td
              style={{ width: "20%" }}
              dangerouslySetInnerHTML={{ __html: mention.context }}
            />
            <td>
              <CheckIcon checked={mention.mention_context.used} />
            </td>
            <td>
              <CheckIcon checked={mention.mention_context.created} />
            </td>
            <td>
              <CheckIcon checked={mention.mention_context.shared} />
            </td>
            <td>
              <LimitedList list={mention.affiliations} max={3} />
            </td>
            <td>
              <LimitedList list={mention.authors} max={5} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
