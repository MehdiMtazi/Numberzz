'use client';

import { useState } from 'react';

export default function EasterEggsPage() {
	const [expandedEgg, setExpandedEgg] = useState<string | null>(null);

	const easterEggs = [
		{
			id: "darius",
			symbol: "Ð",
			name: "Darius Coin",
			type: "FREE",
			typeColor: "#10b981",
			trigger: "Cherche 'darius' dans la search bar et appuie sur Enter",
			reference: "League of Legends",
			description: "L'homme au bras de gigantotitan! Darius, le puissant général noxien, conquérant et chef de guerre.",
			culturalNote: "Référence au champion Darius, connu pour son ultimate dévastateur 'Couperet Noxien' qui réinitialise son cooldown à chaque élimination.",
			tips: "Les amateurs de League of Legends vont adorer ce trésor!",
			difficulty: "🟢 Facile"
		},
		{
			id: "nyan",
			symbol: "🌈",
			name: "Nyan Cat Coin",
			type: "FREE",
			typeColor: "#10b981",
			trigger: "Cherche 'nyan' dans la search bar et appuie sur Enter",
			reference: "Internet Culture",
			description: "Le chat arc-en-ciel légendaire! Nyan Cat est l'une des créatures les plus iconiques d'Internet.",
			culturalNote: "Créé en 2011, Nyan Cat est devenu viral avec sa vidéo YouTube affichant un chat demi-pop-tart traversant l'espace avec un arc-en-ciel.",
			tips: "Le plus ancien mème cat du web! Un incontournable pour les nostalgiques d'Internet des années 2010.",
			difficulty: "🟢 Facile"
		},
		{
			id: "chroma",
			symbol: "◆",
			name: "Chroma Coin",
			type: "FREE",
			typeColor: "#10b981",
			trigger: "Clique 7 fois de suite sur le logo 'Numberz' en haut à gauche",
			reference: "Konami Code",
			description: "Une pierre précieuse multicolore! Le Chroma Coin apparaît après une série de clics sur le logo.",
			culturalNote: "Inspiré du concept du Konami Code (↑ ↑ ↓ ↓ ← → ← → B A), une séquence de boutons cachée dans les jeux Konami.",
			tips: "Clic clic clic... Les easter eggs qui demandent de l'interaction sont souvent les plus satisfaisants!",
			difficulty: "🟡 Moyen"
		},
		{
			id: "wukong",
			symbol: "☯",
			name: "Monkey King Coin",
			type: "PREMIUM",
			typeColor: "#f59e0b",
			price: "0.05 ETH",
			trigger: "Cherche 'wukong' dans la search bar et appuie sur Enter",
			reference: "League of Legends",
			description: "Le roi des singes! Wukong maître du combat martial, prêt à écraser ses ennemis avec son bâton magique.",
			culturalNote: "Le personnage Wukong est inspiré du Roi Singe de la mythologie chinoise (Sun Wukong) de 'Le voyage vers l'Ouest'.",
			tips: "Après déblocage, ce coin rare devient disponible à l'achat. Sécurise-le avant quelqu'un d'autre!",
			difficulty: "🟢 Facile"
		},
		{
			id: "halflife",
			symbol: "½",
			name: "Half-Life Coin",
			type: "PREMIUM",
			typeColor: "#f59e0b",
			price: "0.048 ETH",
			trigger: "Cherche 'half-life' dans la search bar et appuie sur Enter",
			reference: "Gaming",
			description: "Half-Life 3 confirmed? Non, mais ce coin représente l'attente infinie de la communauté gaming.",
			culturalNote: "Half-Life est une série de jeux de tir FPS culte créée par Valve. Le mystère autour de Half-Life 3 est devenu un mème.",
			tips: "La fraction '½' représente parfaitement l'incomplétion de la série. Un mème pour les vrais gamers!",
			difficulty: "🟢 Facile"
		},
		{
			id: "meme",
			symbol: "🎲",
			name: "Meme Coin",
			type: "PREMIUM",
			typeColor: "#f59e0b",
			price: "0.042 ETH",
			trigger: "Cherche 'meme' dans la search bar et appuie sur Enter",
			reference: "Internet Culture",
			description: "Incroyable! C'est le coin pour tous les amateurs de culture Internet.",
			culturalNote: "Les mèmes sont au cœur de la culture Internet moderne. Ce coin célèbre tous les mèmes qui ont façonné le web.",
			tips: "Comment appelle-t-on un coin mème? Un 'MémeToken'! 😄",
			difficulty: "🟡 Moyen"
		},
		{
			id: "secret",
			symbol: "🔐",
			name: "Secret Coin",
			type: "PREMIUM",
			typeColor: "#f59e0b",
			price: "0.035 ETH",
			trigger: "Appuie 10 fois consécutives sur le bouton 'Search' (ou utilise 10 recherches de suite)",
			reference: "Mystery",
			description: "Mystérieux! Ce coin représente le secret ultime caché dans l'application.",
			culturalNote: "Les coins secrets sont une tradition dans le gaming et les applications web. Celui-ci récomparde la persévérance!",
			tips: "Ce secret demande plus d'efforts que les autres. Qui trouvera le pattern caché?",
			difficulty: "🔴 Difficile"
		}
	];

	return (
		<div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #070812 0%, #1a1a2e 100%)', color: 'white', fontFamily: 'Inter, sans-serif'}}>
			{/* Header */}
			<div style={{padding: '4rem 2rem 2rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
				<h1 style={{fontSize: '3rem', fontWeight: 900, marginBottom: '1rem'}}>
					🔮 Guide Complet des Easter Eggs
				</h1>
				<p style={{fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto'}}>
					Découvrez tous les trésors cachés de Numberz. Trouvez les easter eggs, déverrouillez les coins secrets, et complétez votre collection!
				</p>
			</div>

			<div style={{maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem'}}>
				{/* Legend */}
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '3rem'}}>
					<div style={{background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1.5rem', borderRadius: '0.75rem'}}>
						<div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>🟢 FREE</div>
						<p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem'}}>
							Accordez directement à votre collection sans coût
						</p>
					</div>
					<div style={{background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1.5rem', borderRadius: '0.75rem'}}>
						<div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>🟠 PREMIUM</div>
						<p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem'}}>
							Disponible à l'achat après déblocage
						</p>
					</div>
				</div>

				{/* Easter Eggs List */}
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem'}}>
					{easterEggs.map((egg) => (
						<div
							key={egg.id}
							onClick={() => setExpandedEgg(expandedEgg === egg.id ? null : egg.id)}
							style={{
								background: 'rgba(255,255,255,0.05)',
								border: '1px solid rgba(255,255,255,0.1)',
								borderRadius: '0.75rem',
								padding: '1.5rem',
								cursor: 'pointer',
								transition: 'all 300ms ease',
								transform: expandedEgg === egg.id ? 'scale(1.02)' : 'scale(1)',
								boxShadow: expandedEgg === egg.id ? '0 10px 40px rgba(255,255,255,0.1)' : 'none'
							}}
							onMouseEnter={(e) => {
								(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)';
								(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
							}}
							onMouseLeave={(e) => {
								(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
								(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
							}}
						>
							{/* Header */}
							<div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
								<div style={{fontSize: '3rem'}}>{egg.symbol}</div>
								<div style={{flex: 1}}>
									<h3 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem'}}>
										{egg.name}
									</h3>
									<div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
										<span style={{
											background: egg.typeColor,
											color: 'white',
											padding: '0.25rem 0.75rem',
											borderRadius: '0.25rem',
											fontSize: '0.75rem',
											fontWeight: 600
										}}>
											{egg.type}
										</span>
										{egg.price && <span style={{fontSize: '0.9rem', color: '#fbbf24'}}>{egg.price}</span>}
									</div>
								</div>
							</div>

							{/* Trigger */}
							<div style={{background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem'}}>
								<span style={{fontWeight: 600, color: '#818cf8'}}>🎯 Trigger:</span> {egg.trigger}
							</div>

							{/* Quick Stats */}
							<div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem'}}>
								<div style={{fontSize: '0.85rem'}}>
									<span style={{color: 'rgba(255,255,255,0.5)'}}>Référence:</span>
									<div style={{fontWeight: 600, color: '#f472b6'}}>{egg.reference}</div>
								</div>
								<div style={{fontSize: '0.85rem'}}>
									<span style={{color: 'rgba(255,255,255,0.5)'}}>Difficulté:</span>
									<div style={{fontWeight: 600}}>{egg.difficulty}</div>
								</div>
							</div>

							{/* Description */}
							<p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1rem'}}>
								{egg.description}
							</p>

							{/* Expanded Content */}
							{expandedEgg === egg.id && (
								<div style={{borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', animation: 'fadeIn 0.3s ease-out'}}>
									<div style={{marginBottom: '1rem'}}>
										<h4 style={{fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fbbf24'}}>
											📚 Note Culturelle
										</h4>
										<p style={{fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6}}>
											{egg.culturalNote}
										</p>
									</div>
									<div>
										<h4 style={{fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f472b6'}}>
											💡 Conseils de Chasse aux Trésors
										</h4>
										<p style={{fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6}}>
											{egg.tips}
										</p>
									</div>
								</div>
							)}

							{/* Click hint */}
							<div style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '1rem', textAlign: 'center'}}>
								{expandedEgg === egg.id ? '▲ Cliquer pour fermer' : '▼ Cliquer pour plus de détails'}
							</div>
						</div>
					))}
				</div>

				{/* Strategy Section */}
				<div style={{marginTop: '4rem', padding: '2rem', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '0.75rem'}}>
					<h2 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem'}}>🗺️ Stratégie de Chasse aux Trésors</h2>
					
					<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
						<div>
							<h3 style={{fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#f472b6'}}>
								📍 Phase 1: Collection Gratuite
							</h3>
							<ul style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8}}>
								<li>✓ Débloque Darius, Nyan Cat et Chroma</li>
								<li>✓ Ajoute-les à ta collection gratuitement</li>
								<li>✓ Complète le trio "Free Exotic"</li>
							</ul>
						</div>
						<div>
							<h3 style={{fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#fbbf24'}}>
								💎 Phase 2: Collection Premium
							</h3>
							<ul style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8}}>
								<li>✓ Débloque Wukong, Half-Life, Meme</li>
								<li>✓ Achète-les avant que d'autres ne les collectent</li>
								<li>✓ Gagne l'achievement "Exotic Collector"</li>
							</ul>
						</div>
						<div>
							<h3 style={{fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#10b981'}}>
								🏆 Phase 3: Le Secret
							</h3>
							<ul style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8}}>
								<li>✓ Cherche le Secret Coin (le plus difficile!)</li>
								<li>✓ Demande 10 interactions rapides</li>
								<li>✓ Récompense ultime pour les explorateurs</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Tips Section */}
				<div style={{marginTop: '3rem', padding: '2rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '0.75rem'}}>
					<h2 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem'}}>🔍 Conseils Généraux</h2>
					<ul style={{fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 2, paddingLeft: '1.5rem'}}>
						<li>• Les easter eggs sont mieux découverts en explorant naturellement l'app</li>
						<li>• Certains triggers demandent de l'interaction (clics, entrées multiples)</li>
						<li>• Les coins gratuits complètent magnifiquement les collections Legendary</li>
						<li>• Les coins premium sont limités - achète-les vite pour éviter de les manquer!</li>
						<li>• Chaque découverte rapproche d'achievements spéciaux</li>
						<li>• Les références culturelles enrichissent l'expérience de chasse</li>
						<li>• Partage tes trouvailles avec la communauté!</li>
					</ul>
				</div>

				{/* Fun Fact */}
				<div style={{marginTop: '3rem', padding: '2rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.05)', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '0.75rem'}}>
					<div style={{fontSize: '1.5rem', marginBottom: '1rem'}}>🌟</div>
					<h3 style={{fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem'}}>
						Fait Amusant
					</h3>
					<p style={{fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.8}}>
						Chaque easter egg est une célébration de la culture Internet et du gaming. Ensemble, ils racontent l'histoire des mèmes et des références qui ont façonné le web. Bonne chasse aux trésors! 🏆
					</p>
				</div>
			</div>

			{/* Back Button */}
			<div style={{padding: '2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
				<a href="/" style={{
					display: 'inline-block',
					padding: '0.75rem 1.5rem',
					background: 'rgba(99, 102, 241, 0.2)',
					border: '1px solid rgba(99, 102, 241, 0.4)',
					borderRadius: '0.5rem',
					color: '#818cf8',
					textDecoration: 'none',
					fontWeight: 600,
					cursor: 'pointer',
					transition: 'all 200ms ease'
				}}
				onMouseEnter={(e) => {
					(e.currentTarget as HTMLElement).style.background = 'rgba(99, 102, 241, 0.3)';
					(e.currentTarget as HTMLElement).style.borderColor = 'rgba(99, 102, 241, 0.6)';
				}}
				onMouseLeave={(e) => {
					(e.currentTarget as HTMLElement).style.background = 'rgba(99, 102, 241, 0.2)';
					(e.currentTarget as HTMLElement).style.borderColor = 'rgba(99, 102, 241, 0.4)';
				}}
				>
					← Retour à la Collection
				</a>
			</div>
		</div>
	);
}
