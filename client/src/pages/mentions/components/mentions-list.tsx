import { Button, Col, Container, Link, Row } from "@dataesr/dsfr-plus";
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

function SortButton({ id, label, params, setParams }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Button
        className="fr-ml-1v"
        color="beige-gris-galet"
        onClick={() => {
          setParams({
            ...params,
            sortBy: id,
            sortOrder: "asc",
          });
        }}
        size="sm"
        variant="text"
      >
        {label}
      </Button>
      {params.sortBy === id && (
        <Button
          className="fr-ml-1v"
          color="beige-gris-galet"
          onClick={() => {
            setParams({
              ...params,
              sortBy: id,
              sortOrder: params.sortOrder === "asc" ? "desc" : "asc",
            });
          }}
          size="sm"
          variant="text"
        >
          {params.sortBy === id && params.sortOrder === "asc" && <>▲</>}
          {params.sortBy === id && params.sortOrder === "desc" && <>▼</>}
        </Button>
      )}
    </div>
  );
}

export default function MentionsList({ mentions, params, setParams }) {
  return (
    <table className="mentions-list">
      <thead>
        <tr>
          <th>
            <SortButton
              id="doi"
              label="DOI"
              params={params}
              setParams={setParams}
            />
          </th>
          <th>
            <SortButton
              id="rawForm"
              label="Raw form"
              params={params}
              setParams={setParams}
            />
          </th>
          <th>Context</th>
          <th
            style={{ writingMode: "vertical-rl", transform: "rotate(210deg)" }}
          >
            <SortButton
              id="mention.mention_context.used"
              label="Used"
              params={params}
              setParams={setParams}
            />
          </th>
          <th
            style={{ writingMode: "vertical-rl", transform: "rotate(210deg)" }}
          >
            <SortButton
              id="mention.mention_context.created"
              label="Created"
              params={params}
              setParams={setParams}
            />
          </th>
          <th
            style={{ writingMode: "vertical-rl", transform: "rotate(210deg)" }}
          >
            <SortButton
              id="mention.mention_context.shared"
              label="Shared"
              params={params}
              setParams={setParams}
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
