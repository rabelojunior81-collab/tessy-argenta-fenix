/**
 * MSW handlers — intercepção de APIs externas nos testes.
 * TDP §6: IA com transparência operacional — mocks documentados.
 *
 * Adicionar handlers específicos por serviço:
 *   - gemini: intercepta POST para generativelanguage.googleapis.com
 *   - github: intercepta GET/POST para api.github.com
 *   - broker: intercepta HTTP para localhost:3002
 */
import { HttpResponse, http } from 'msw';

export const handlers = [
  // Broker health check
  http.get('http://localhost:3002/health', () => {
    return HttpResponse.json({ status: 'ok', mode: 'broker', shell: 'bash' });
  }),

  // GitHub API — stub para testes de GitHubContext
  http.get('https://api.github.com/repos/:owner/:repo', ({ params }) => {
    return HttpResponse.json({
      name: params.repo,
      full_name: `${params.owner}/${params.repo}`,
      default_branch: 'main',
    });
  }),
];
