const { createAgency } = require('./pantheon');

async function main() {
  const team = await createAgency({
    researcher: 'operator',
    writer: 'niobe',
    reviewer: 'sentinel'
  }, 'sequential');

  console.log('Team agency created, running sequential pipeline...\n');
  console.log('Agents: researcher (operator) -> writer (niobe) -> reviewer (sentinel)\n');

  const stream = team.stream(
    'Write a brief explanation of what an Agentic Operating System is, in 3 sentences.'
  );

  for await (const chunk of stream.textStream) {
    process.stdout.write(chunk);
  }

  const text = await stream.text;
  console.log('\n\n--- FINAL ---\n' + text);

  team.close();
}

main().catch(console.error);
