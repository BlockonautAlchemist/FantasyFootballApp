import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'League ID is required' });
  }

  // Read access token from cookie
  const accessToken = req.cookies.yahoo_access;
  
  if (!accessToken) {
    return res.status(401).json({
      error: 'no_access_token',
      error_description: 'No access token found in cookies. Please authenticate first.'
    });
  }

  try {
    // For now, just return a mock linked league
    // In a real implementation, this would store the linked league in a database
    const linkedLeague = {
      id: id as string,
      leagueKey: `nfl.l.${id}`,
      leagueName: `League ${id}`,
      season: '2024',
      teamKey: `nfl.l.${id}.t.1`,
      teamName: 'My Team',
      teamLogo: undefined,
      isLinked: true
    };
    
    return res.status(200).json(linkedLeague);

  } catch (error) {
    console.error('Error linking league:', error);
    return res.status(500).json({
      error: 'internal_error',
      error_description: 'Failed to link league'
    });
  }
}
