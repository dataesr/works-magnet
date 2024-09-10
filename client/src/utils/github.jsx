const {
  VITE_API,
} = import.meta.env;

const sendGitHubIssue = async (data) => {
  const params = JSON.stringify(data);
  return fetch(`${VITE_API}/github-issue`, {
    method: 'POST',
    body: params,
    headers: { 'Content-Type': 'application/json' },
  }).then((response) => {
    if (response.ok) return response.json();
    throw new Error(response.statusText);
  });
};

export {
  sendGitHubIssue,
};
