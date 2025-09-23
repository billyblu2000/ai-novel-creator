const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function insertSimplePlotData() {
  try {
    // 获取项目
    let project = await prisma.project.findFirst();
    
    if (!project) {
      console.log('没有找到项目，请先运行 insert-test-data.js');
      return;
    }

    console.log('使用项目:', project.title, '(ID:', project.id, ')');

    // 创建简单的情节数据
    const plotElements = [
      // 顶层：书
      {
        title: '时空穿越者',
        summary: '一个关于时空穿越的奇幻冒险故事，讲述了一个普通大学生意外获得穿越能力后的成长历程。',
        type: 'book',
        status: 'outlined',
        order: 1,
        wordCount: 0,
        targetWords: 200000,
        projectId: project.id,
        parentId: null
      }
    ];

    // 插入顶层元素
    const book = await prisma.plotElement.create({
      data: plotElements[0]
    });
    console.log(`✓ 创建情节: ${book.title} (类型: ${book.type})`);

    // 创建第一部
    const part1 = await prisma.plotElement.create({
      data: {
        title: '第一部：觉醒',
        summary: '主角李明轩发现自己的穿越能力，开始探索这个神秘的世界。',
        type: 'part',
        status: 'outlined',
        order: 1,
        wordCount: 0,
        targetWords: 80000,
        projectId: project.id,
        parentId: book.id
      }
    });
    console.log(`✓ 创建情节: ${part1.title} (类型: ${part1.type})`);

    // 创建第一章
    const chapter1 = await prisma.plotElement.create({
      data: {
        title: '第一章：意外的发现',
        summary: '李明轩在大学图书馆地下室意外发现了时空之门。',
        type: 'chapter',
        status: 'drafted',
        order: 1,
        wordCount: 3500,
        targetWords: 4000,
        mood: '神秘、紧张',
        pov: '第三人称',
        projectId: project.id,
        parentId: part1.id
      }
    });
    console.log(`✓ 创建情节: ${chapter1.title} (类型: ${chapter1.type})`);

    // 创建场景
    const scenes = [
      {
        title: '图书馆的秘密',
        summary: '李明轩在查找资料时发现了隐藏的地下室入口。',
        type: 'scene',
        status: 'completed',
        order: 1,
        wordCount: 1200,
        targetWords: 1200,
        mood: '好奇、探索',
        projectId: project.id,
        parentId: chapter1.id
      },
      {
        title: '时空之门的显现',
        summary: '古老的符文开始发光，时空之门缓缓打开。',
        type: 'scene',
        status: 'completed',
        order: 2,
        wordCount: 1500,
        targetWords: 1500,
        mood: '震撼、恐惧',
        projectId: project.id,
        parentId: chapter1.id
      },
      {
        title: '初次穿越',
        summary: '李明轩被吸入时空之门，来到了古代。',
        type: 'scene',
        status: 'drafted',
        order: 3,
        wordCount: 800,
        targetWords: 1300,
        mood: '混乱、惊恐',
        projectId: project.id,
        parentId: chapter1.id
      }
    ];

    for (const sceneData of scenes) {
      const scene = await prisma.plotElement.create({ data: sceneData });
      console.log(`✓ 创建情节: ${scene.title} (类型: ${scene.type})`);
    }

    // 创建第二章
    const chapter2 = await prisma.plotElement.create({
      data: {
        title: '第二章：古代的邂逅',
        summary: '李明轩在古代遇到了苏雨晴的前世，开始了解时空穿越的规则。',
        type: 'chapter',
        status: 'outlined',
        order: 2,
        wordCount: 0,
        targetWords: 4500,
        mood: '浪漫、神秘',
        pov: '第三人称',
        projectId: project.id,
        parentId: part1.id
      }
    });
    console.log(`✓ 创建情节: ${chapter2.title} (类型: ${chapter2.type})`);

    // 创建第二章的场景
    const chapter2Scenes = [
      {
        title: '古代集市',
        summary: '李明轩在古代集市中迷失方向，观察古代生活。',
        type: 'scene',
        status: 'planned',
        order: 1,
        wordCount: 0,
        targetWords: 1500,
        mood: '新奇、困惑',
        projectId: project.id,
        parentId: chapter2.id
      },
      {
        title: '命运的相遇',
        summary: '李明轩遇到了苏雨晴的前世——古代才女林诗韵。',
        type: 'scene',
        status: 'planned',
        order: 2,
        wordCount: 0,
        targetWords: 2000,
        mood: '惊喜、命运感',
        projectId: project.id,
        parentId: chapter2.id
      }
    ];

    for (const sceneData of chapter2Scenes) {
      const scene = await prisma.plotElement.create({ data: sceneData });
      console.log(`✓ 创建情节: ${scene.title} (类型: ${scene.type})`);
    }

    // 创建第二部
    const part2 = await prisma.plotElement.create({
      data: {
        title: '第二部：探索',
        summary: '李明轩开始主动探索不同的时空，寻找穿越的真相。',
        type: 'part',
        status: 'planned',
        order: 2,
        wordCount: 0,
        targetWords: 70000,
        projectId: project.id,
        parentId: book.id
      }
    });
    console.log(`✓ 创建情节: ${part2.title} (类型: ${part2.type})`);

    // 创建第二部的章节
    const part2Chapters = [
      {
        title: '第四章：伙伴的加入',
        summary: '苏雨晴发现了李明轩的秘密，决定一起探索时空的奥秘。',
        type: 'chapter',
        status: 'planned',
        order: 1,
        wordCount: 0,
        targetWords: 4200,
        mood: '合作、信任',
        pov: '第三人称',
        projectId: project.id,
        parentId: part2.id
      },
      {
        title: '第五章：暗影的威胁',
        summary: '暗影领主的手下开始在各个时空中追捕李明轩。',
        type: 'chapter',
        status: 'planned',
        order: 2,
        wordCount: 0,
        targetWords: 5000,
        mood: '紧张、危险',
        pov: '第三人称',
        projectId: project.id,
        parentId: part2.id
      }
    ];

    for (const chapterData of part2Chapters) {
      const chapter = await prisma.plotElement.create({ data: chapterData });
      console.log(`✓ 创建情节: ${chapter.title} (类型: ${chapter.type})`);
    }

    console.log('\n🎉 情节数据插入完成！');
    console.log('\n层级结构预览:');
    console.log('📚 时空穿越者 (书)');
    console.log('  📖 第一部：觉醒 (部)');
    console.log('    📄 第一章：意外的发现 (章)');
    console.log('      🎬 图书馆的秘密 (场景)');
    console.log('      🎬 时空之门的显现 (场景)');
    console.log('      🎬 初次穿越 (场景)');
    console.log('    📄 第二章：古代的邂逅 (章)');
    console.log('      🎬 古代集市 (场景)');
    console.log('      🎬 命运的相遇 (场景)');
    console.log('  📖 第二部：探索 (部)');
    console.log('    📄 第四章：伙伴的加入 (章)');
    console.log('    📄 第五章：暗影的威胁 (章)');

  } catch (error) {
    console.error('插入情节数据时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

insertSimplePlotData();