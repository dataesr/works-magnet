const {
  VITE_API,
} = import.meta.env;

const sendGitHubIssue = async (data) => {
  const params = JSON.stringify(data);
  console.log('ttt1', params);
  return fetch(`${VITE_API}/github-issue`, {
    method: 'POST',
    body: params,
    params,
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => {
      if (response.ok) return response.json();
      return 'Oops... GitHub request error';
    });
};

export {
  sendGitHubIssue,
};
