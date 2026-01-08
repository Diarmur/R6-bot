export const rankNames = [
  'Unranked',       
  'Copper 5','Copper 4','Copper 3','Copper 2','Copper 1',
  'Bronze 5','Bronze 4','Bronze 3','Bronze 2','Bronze 1',
  'Silver 5','Silver 4','Silver 3','Silver 2','Silver 1',
  'Gold 5','Gold 4','Gold 3','Gold 2','Gold 1',
  'Platinum 5','Platinum 4','Platinum 3','Platinum 2','Platinum 1',
  'Diamond 5','Diamond 4','Diamond 3','Diamond 2','Diamond 1',
  'Champion'
];

export const rankToRoleMap: Record<string, string> = {
  'Unranked': 'Non classé',
  'Copper 5':'Cuivre 5','Copper 4':'Cuivre 4','Copper 3':'Cuivre 3','Copper 2':'Cuivre 2','Copper 1':'Cuivre 1',
  'Bronze 5':'Bronze 5','Bronze 4':'Bronze 4','Bronze 3':'Bronze 3','Bronze 2':'Bronze 2','Bronze 1':'Bronze 1',
  'Silver 5':'Argent 5','Silver 4':'Argent 4','Silver 3':'Argent 3','Silver 2':'Argent 2','Silver 1':'Argent 1',
  'Gold 5':'Gold 5','Gold 4':'Gold 4','Gold 3':'Gold 3','Gold 2':'Gold 2','Gold 1':'Gold 1',
  'Platinum 5':'Plat 5','Platinum 4':'Plat 4','Platinum 3':'Plat 3','Platinum 2':'Plat 2','Platinum 1':'Plat 1',
  'Diamond 5':'Diamant 5','Diamond 4':'Diamant 4','Diamond 3':'Diamant 3','Diamond 2':'Diamant 2','Diamond 1':'Diamant 1',
  'Champion':'Champion'
};

export function getRankName(rank: number): string {
  return rankNames[rank] || 'Unranked';
}