const prisma = require('../utils/prisma');
const path = require('path');

const createMember = async (req, res) => {
  try {
    const {
      // 1- Informations de l'adhérent
      nom,
      prenom,
      telephone,
      email,
      adresse,
      adresseComplement,
      profession,
      genre,
      dateNaissance,
      
      // 2- Autres informations
      situationMatrimoniale,
      decouverteDahira,
      commission,
      niveauArabe,
      categorie,
      
      // 3- Informations médicales
      antecedentsMedicaux,
      allergies,
      traitements,
      contactUrgenceTel,
      
      // 4- Informations du parent ou tuteur
      typeAutorite,
      contactUrgenceNom,
      contactUrgencePrenom,
      contactUrgenceTelephone,
      
      // Informations système
      numeroAdhesion
    } = req.body;

    // Validation des champs requis
    if (!prenom || !nom || !genre || !dateNaissance || !telephone || !adresse || !numeroAdhesion) {
      return res.status(400).json({ error: 'Les champs nom, prénom, genre, date de naissance, téléphone, adresse et numéro d\'adhésion sont obligatoires' });
    }

    // Vérifier l'unicité du téléphone et numéro d'adhésion
    const existingMember = await prisma.member.findFirst({
      where: {
        OR: [
          { telephone },
          { numeroAdhesion }
        ]
      }
    });

    if (existingMember) {
      if (existingMember.telephone === telephone) {
        return res.status(400).json({ error: 'Ce numéro de téléphone est déjà utilisé' });
      }
      if (existingMember.numeroAdhesion === numeroAdhesion) {
        return res.status(400).json({ error: 'Ce numéro d\'adhésion est déjà utilisé' });
      }
    }

    // Gérer l'upload de photo
    let photoProfile = null;
    if (req.file) {
      photoProfile = `/uploads/profiles/${req.file.filename}`;
    }

    const member = await prisma.member.create({
      data: {
        // 1- Informations de l'adhérent
        nom,
        prenom,
        telephone,
        email: email || null,
        adresse,
        adresseComplement: adresseComplement || null,
        profession: profession || null,
        genre,
        dateNaissance: new Date(dateNaissance),
        
        // 2- Autres informations
        situationMatrimoniale: situationMatrimoniale || null,
        decouverteDahira: decouverteDahira || null,
        commission: commission || null,
        niveauArabe: niveauArabe || null,
        categorie: categorie || null,
        
        // 3- Informations médicales
        antecedentsMedicaux: antecedentsMedicaux || null,
        allergies: allergies || null,
        traitements: traitements || null,
        contactUrgenceTel: contactUrgenceTel || null,
        
        // 4- Informations du parent ou tuteur
        typeAutorite: typeAutorite || null,
        contactUrgenceNom: contactUrgenceNom || null,
        contactUrgencePrenom: contactUrgencePrenom || null,
        contactUrgenceTelephone: contactUrgenceTelephone || null,
        
        // Informations système
        numeroAdhesion,
        photoProfile
      }
    });

    res.status(201).json({
      message: 'Membre créé avec succès',
      member
    });
  } catch (error) {
    console.error('Erreur lors de la création du membre:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, genre, commission, profession } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construire les filtres
    const where = {};
    
    // Recherche avancée
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { prenom: { contains: searchTerm } },
        { nom: { contains: searchTerm } },
        { telephone: { contains: searchTerm } },
        { numeroAdhesion: { contains: searchTerm } },
        { email: { contains: searchTerm } },
        { adresse: { contains: searchTerm } },
        { profession: { contains: searchTerm } },
        { commission: { contains: searchTerm } }
      ];
    }
    
    // Filtres spécifiques
    if (genre && genre !== 'all') {
      where.genre = genre;
    }
    
    if (commission && commission !== 'all') {
      where.commission = commission;
    }
    
    if (profession && profession !== 'all') {
      where.profession = { contains: profession };
    }

    console.log('Recherche avec filtres:', { search, genre, commission, profession, where });

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              cotisations: true,
              eventParticipations: true
            }
          }
        }
      }),
      prisma.member.count({ where })
    ]);

    console.log(`Résultats: ${members.length} membres trouvés sur ${total} total`);

    res.json({
      members,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        cotisations: {
          orderBy: { semaine: 'desc' },
          take: 10
        },
        eventParticipations: {
          include: {
            event: {
              select: {
                id: true,
                titre: true,
                dateDebut: true,
                montantContribution: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    res.json({ member });
  } catch (error) {
    console.error('Erreur lors de la récupération du membre:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Vérifier si le membre existe
    const existingMember = await prisma.member.findUnique({
      where: { id }
    });

    if (!existingMember) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    // Vérifier l'unicité du téléphone et numéro d'adhésion si modifiés
    if (updateData.telephone || updateData.numeroAdhesion) {
      const conflictMember = await prisma.member.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(updateData.telephone ? [{ telephone: updateData.telephone }] : []),
                ...(updateData.numeroAdhesion ? [{ numeroAdhesion: updateData.numeroAdhesion }] : [])
              ]
            }
          ]
        }
      });

      if (conflictMember) {
        if (conflictMember.telephone === updateData.telephone) {
          return res.status(400).json({ error: 'Ce numéro de téléphone est déjà utilisé' });
        }
        if (conflictMember.numeroAdhesion === updateData.numeroAdhesion) {
          return res.status(400).json({ error: 'Ce numéro d\'adhésion est déjà utilisé' });
        }
      }
    }

    // Gérer l'upload de nouvelle photo
    if (req.file) {
      updateData.photoProfile = `/uploads/profiles/${req.file.filename}`;
    }

    // Convertir les dates si fournies
    if (updateData.dateNaissance) {
      updateData.dateNaissance = new Date(updateData.dateNaissance);
    }
    
    if (updateData.dateAdhesion) {
      updateData.dateAdhesion = new Date(updateData.dateAdhesion);
    }

    const updatedMember = await prisma.member.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Membre mis à jour avec succès',
      member: updatedMember
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du membre:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: { id }
    });

    if (!member) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    await prisma.member.delete({
      where: { id }
    });

    res.json({ message: 'Membre supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du membre:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getMemberStats = async (req, res) => {
  try {
    const [totalMembers, genreStats, commissionStats, professionStats] = await Promise.all([
      prisma.member.count(),
      prisma.member.groupBy({
        by: ['genre'],
        _count: {
          genre: true
        }
      }),
      prisma.member.groupBy({
        by: ['commission'],
        _count: {
          commission: true
        },
        where: {
          commission: {
            not: null
          }
        }
      }),
      prisma.member.groupBy({
        by: ['profession'],
        _count: {
          profession: true
        },
        where: {
          profession: {
            not: null
          }
        }
      })
    ]);

    // Extraire les options uniques
    const commissions = commissionStats.map(stat => stat.commission);
    const professions = professionStats.map(stat => stat.profession);

    res.json({
      totalMembers,
      genreStats,
      commissionStats,
      professionStats,
      filterOptions: {
        commissions,
        professions
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const exportMembersToExcel = async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Membres');

    // Récupérer tous les membres
    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Définir les colonnes
    worksheet.columns = [
      { header: 'N° Adhésion', key: 'numeroAdhesion', width: 15 },
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Prénom', key: 'prenom', width: 20 },
      { header: 'Téléphone', key: 'telephone', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Adresse', key: 'adresse', width: 30 },
      { header: 'Profession', key: 'profession', width: 20 },
      { header: 'Genre', key: 'genre', width: 10 },
      { header: 'Date de naissance', key: 'dateNaissance', width: 15 },
      { header: 'Situation matrimoniale', key: 'situationMatrimoniale', width: 20 },
      { header: 'Date d\'adhésion', key: 'dateAdhesion', width: 15 },
      { header: 'Commission', key: 'commission', width: 20 },
      { header: 'Niveau arabe', key: 'niveauArabe', width: 15 },
      { header: 'Contact urgence', key: 'contactUrgenceNom', width: 25 },
      { header: 'Téléphone urgence', key: 'contactUrgenceTelephone', width: 15 }
    ];

    // Ajouter les données
    members.forEach(member => {
      worksheet.addRow({
        numeroAdhesion: member.numeroAdhesion,
        nom: member.nom,
        prenom: member.prenom,
        telephone: member.telephone,
        email: member.email || '',
        adresse: member.adresse,
        profession: member.profession || '',
        genre: member.genre,
        dateNaissance: member.dateNaissance ? member.dateNaissance.toLocaleDateString('fr-FR') : '',
        situationMatrimoniale: member.situationMatrimoniale || '',
        dateAdhesion: member.dateAdhesion ? member.dateAdhesion.toLocaleDateString('fr-FR') : '',
        commission: member.commission || '',
        niveauArabe: member.niveauArabe || '',
        contactUrgenceNom: member.contactUrgenceNom || '',
        contactUrgenceTelephone: member.contactUrgenceTelephone || ''
      });
    });

    // Styliser l'en-tête
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Définir les headers de réponse
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=membres_dahiraa.xlsx');

    // Envoyer le fichier
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export Excel' });
  }
};

const exportMembersToPDF = async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ 
      margin: 40,
      autoFirstPage: true,
      bufferPages: true
    });

    // Récupérer tous les membres
    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Définir les headers de réponse
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=membres_dahiraa.pdf');

    // Pipe le document vers la réponse
    doc.pipe(res);

    // Titre du document
    doc.fontSize(24).font('Helvetica-Bold').text('LISTE DES MEMBRES', { align: 'center' });
    doc.fontSize(16).font('Helvetica').text('Dahiraa', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Genere le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}`, { align: 'center' });
    doc.moveDown(2);

    // Informations générales
    doc.fontSize(14).font('Helvetica-Bold').text(`TOTAL DES MEMBRES : ${members.length}`, { align: 'center' });
    doc.moveDown(2);

    // Tableau récapitulatif
    doc.fontSize(16).font('Helvetica-Bold').text('RECAPITULATIF DES MEMBRES', { underline: true });
    doc.moveDown();

    // En-tête du tableau
    const tableTop = doc.y;
    const tableLeft = 40;
    const colWidths = [80, 120, 100, 120, 100, 80];
    const headers = ['N° Adhesion', 'Nom & Prenom', 'Telephone', 'Email', 'Profession', 'Commission'];
    
    doc.fontSize(10).font('Helvetica-Bold');
    let x = tableLeft;
    headers.forEach((header, i) => {
      doc.text(header, x, tableTop);
      x += colWidths[i];
    });

    // Ligne de séparation
    doc.moveTo(tableLeft, tableTop + 15).lineTo(tableLeft + 600, tableTop + 15).stroke();

    // Données du tableau
    doc.fontSize(9).font('Helvetica');
    let y = tableTop + 20;
    
    members.forEach((member, index) => {
      if (y > 700) {
        doc.addPage();
        y = 40;
        // Réafficher l'en-tête
        doc.fontSize(10).font('Helvetica-Bold');
        x = tableLeft;
        headers.forEach((header, i) => {
          doc.text(header, x, y);
          x += colWidths[i];
        });
        doc.moveTo(tableLeft, y + 15).lineTo(tableLeft + 600, y + 15).stroke();
        y += 20;
        doc.fontSize(9).font('Helvetica');
      }

      x = tableLeft;
      doc.text(member.numeroAdhesion || '-', x, y);
      x += colWidths[0];
      
      doc.text(`${member.nom} ${member.prenom}`, x, y);
      x += colWidths[1];
      
      doc.text(member.telephone || '-', x, y);
      x += colWidths[2];
      
      doc.text(member.email || '-', x, y);
      x += colWidths[3];
      
      doc.text(member.profession || '-', x, y);
      x += colWidths[4];
      
      doc.text(member.commission || '-', x, y);

      y += 15;
    });

    // Page suivante : Détails complets
    doc.addPage();
    doc.fontSize(20).font('Helvetica-Bold').text('DETAILS COMPLETS DES MEMBRES', { align: 'center' });
    doc.moveDown(2);

    members.forEach((member, index) => {
      // Vérifier si on doit passer à une nouvelle page
      if (doc.y > 650) {
        doc.addPage();
        doc.fontSize(20).font('Helvetica-Bold').text('DETAILS COMPLETS DES MEMBRES (SUITE)', { align: 'center' });
        doc.moveDown(2);
      }

      // En-tête du membre
      doc.fontSize(16).font('Helvetica-Bold').text(`MEMBRE N°${index + 1}`, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica-Bold').text(`${member.nom} ${member.prenom}`, { color: 'blue' });
      doc.fontSize(12).text(`Numero d'adhesion : ${member.numeroAdhesion}`, { color: 'darkblue' });
      doc.moveDown();

      // Informations de base
      doc.fontSize(11).font('Helvetica-Bold').text('INFORMATIONS DE BASE', { color: 'darkgreen' });
      doc.fontSize(10).font('Helvetica');
      doc.text(`   Telephone : ${member.telephone}`);
      if (member.email) doc.text(`   Email : ${member.email}`);
      doc.text(`   Adresse : ${member.adresse}`);
      if (member.adresseComplement) doc.text(`   Complement : ${member.adresseComplement}`);
      if (member.profession) doc.text(`   Profession : ${member.profession}`);
      doc.text(`   Genre : ${member.genre}`);
      doc.text(`   Date de naissance : ${member.dateNaissance.toLocaleDateString('fr-FR')}`);
      doc.moveDown();

      // Informations Dahiraa
      doc.fontSize(11).font('Helvetica-Bold').text('INFORMATIONS DAHIRAA', { color: 'darkgreen' });
      doc.fontSize(10).font('Helvetica');
      doc.text(`   Date d'adhesion : ${member.dateAdhesion.toLocaleDateString('fr-FR')}`);
      if (member.situationMatrimoniale) doc.text(`   Situation matrimoniale : ${member.situationMatrimoniale}`);
      if (member.decouverteDahira) doc.text(`   Decouverte Dahiraa : ${member.decouverteDahira}`);
      if (member.commission) doc.text(`   Commission : ${member.commission}`);
      if (member.niveauArabe) doc.text(`   Niveau arabe : ${member.niveauArabe}`);
      doc.moveDown();

      // Informations médicales
      if (member.antecedentsMedicaux || member.allergies || member.traitements || member.contactUrgenceTel) {
        doc.fontSize(11).font('Helvetica-Bold').text('INFORMATIONS MEDICALES', { color: 'darkgreen' });
        doc.fontSize(10).font('Helvetica');
        if (member.antecedentsMedicaux) doc.text(`   Antecedents medicaux : ${member.antecedentsMedicaux}`);
        if (member.allergies) doc.text(`   Allergies : ${member.allergies}`);
        if (member.traitements) doc.text(`   Traitements : ${member.traitements}`);
        if (member.contactUrgenceTel) doc.text(`   Telephone urgence : ${member.contactUrgenceTel}`);
        doc.moveDown();
      }

      // Informations du parent/tuteur
      if (member.typeAutorite || member.contactUrgenceNom || member.contactUrgencePrenom || member.contactUrgenceTelephone) {
        doc.fontSize(11).font('Helvetica-Bold').text('INFORMATIONS PARENT/TUTEUR', { color: 'darkgreen' });
        doc.fontSize(10).font('Helvetica');
        if (member.typeAutorite) doc.text(`   Type d'autorite : ${member.typeAutorite}`);
        if (member.contactUrgenceNom) doc.text(`   Nom : ${member.contactUrgenceNom}`);
        if (member.contactUrgencePrenom) doc.text(`   Prenom : ${member.contactUrgencePrenom}`);
        if (member.contactUrgenceTelephone) doc.text(`   Telephone : ${member.contactUrgenceTelephone}`);
        doc.moveDown();
      }

      // Séparateur entre les membres
      if (index < members.length - 1) {
        doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(2);
      }
    });

    // Page de fin
    doc.addPage();
    doc.fontSize(16).font('Helvetica-Bold').text('STATISTIQUES', { align: 'center' });
    doc.moveDown(2);
    
    doc.fontSize(12).font('Helvetica-Bold').text('Repartition par genre :');
    const hommes = members.filter(m => m.genre === 'HOMME').length;
    const femmes = members.filter(m => m.genre === 'FEMME').length;
    doc.fontSize(10).font('Helvetica');
    doc.text(`   Hommes : ${hommes} (${Math.round(hommes/members.length*100)}%)`);
    doc.text(`   Femmes : ${femmes} (${Math.round(femmes/members.length*100)}%)`);
    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').text('Repartition par commission :');
    const commissions = {};
    members.forEach(m => {
      if (m.commission) {
        commissions[m.commission] = (commissions[m.commission] || 0) + 1;
      }
    });
    Object.entries(commissions).forEach(([commission, count]) => {
      doc.fontSize(10).font('Helvetica');
      doc.text(`   ${commission} : ${count} membre(s)`);
    });

    doc.end();
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export PDF' });
  }
};

module.exports = {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  getMemberStats,
  exportMembersToExcel,
  exportMembersToPDF
};

