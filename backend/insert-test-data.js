const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function insertTestData() {
  try {
    // 假设我们有一个项目ID，先获取或创建一个项目
    let project = await prisma.project.findFirst();
    
    if (!project) {
      project = await prisma.project.create({
        data: {
          title: '测试小说项目',
          description: '用于测试重要程度背景色的项目',
          genre: 'fantasy',
          status: 'planning'
        }
      });
    }

    console.log('使用项目:', project.title, '(ID:', project.id, ')');

    // 插入不同重要程度的角色
    const characters = [
      {
        name: '李明轩',
        description: '故事的绝对主角，一个普通的大学生，意外获得了穿越时空的能力。性格善良但有些优柔寡断，在关键时刻总能爆发出惊人的勇气。',
        role: 'protagonist',
        importance: 10,
        projectId: project.id
      },
      {
        name: '苏雨晴',
        description: '女主角，聪明美丽的考古学家，李明轩的青梅竹马。拥有敏锐的洞察力和坚强的意志，是李明轩最重要的伙伴和精神支柱。',
        role: 'protagonist',
        importance: 9,
        projectId: project.id
      },
      {
        name: '暗影领主',
        description: '最终BOSS，来自异次元的强大存在，企图吞噬所有时空。拥有操控暗影和时间的能力，是李明轩必须面对的最大敌人。',
        role: 'antagonist',
        importance: 8,
        projectId: project.id
      },
      {
        name: '张教授',
        description: '苏雨晴的导师，资深考古学家。虽然不知道时空穿越的秘密，但他的考古知识对主角们的冒险起到了重要作用。',
        role: 'supporting',
        importance: 6,
        projectId: project.id
      },
      {
        name: '小白',
        description: '李明轩养的宠物猫，意外也获得了穿越能力。虽然只是宠物，但在关键时刻总能帮上忙，给紧张的剧情增添一些轻松元素。',
        role: 'supporting',
        importance: 4,
        projectId: project.id
      },
      {
        name: '咖啡店老板',
        description: '李明轩经常去的咖啡店的老板，一个和蔼的中年人。偶尔会给主角一些人生建议，但对主线剧情影响不大。',
        role: 'minor',
        importance: 2,
        projectId: project.id
      }
    ];

    // 插入不同重要程度的世界设定
    const worldSettings = [
      {
        title: '时空穿越机制',
        content: '通过古老的时空之门进行穿越，每次穿越都会消耗大量精神力。穿越者必须在24小时内返回，否则会被困在异时空中。时空之门隐藏在世界各地的古迹中，需要特殊的钥匙才能激活。',
        category: 'magic',
        importance: 10,
        projectId: project.id
      },
      {
        title: '暗影次元',
        content: '暗影领主的老巢，一个完全由负能量构成的异次元空间。在这里，时间流速不同，物理法则也被扭曲。只有拥有纯净心灵的人才能在这里生存。',
        category: 'geography',
        importance: 8,
        projectId: project.id
      },
      {
        title: '古代文明遗迹',
        content: '散布在世界各地的神秘遗迹，是古代高度发达文明的遗留。这些遗迹中隐藏着时空之门和各种强大的古代科技，但同时也充满了危险的陷阱。',
        category: 'history',
        importance: 7,
        projectId: project.id
      },
      {
        title: '现代都市背景',
        content: '故事发生的主要舞台，一个繁华的现代都市。表面上看起来很普通，但实际上隐藏着许多超自然的秘密。城市中的某些建筑实际上是古代遗迹的伪装。',
        category: 'geography',
        importance: 5,
        projectId: project.id
      },
      {
        title: '大学校园',
        content: '李明轩和苏雨晴就读的大学，一所历史悠久的知名学府。校园里的图书馆地下室隐藏着一个小型的时空之门，这是主角们发现穿越秘密的地方。',
        category: 'geography',
        importance: 3,
        projectId: project.id
      }
    ];

    // 插入不同重要程度的时间线
    const timelines = [
      {
        name: '初次穿越',
        description: '李明轩意外发现时空之门，进行了第一次穿越。这次经历彻底改变了他的人生轨迹，也让他意识到自己肩负的重大使命。',
        storyDate: '第1章',
        timeType: 'symbolic',
        chronOrder: 1,
        importance: 10,
        projectId: project.id
      },
      {
        name: '与暗影领主初次交锋',
        description: '在古代遗迹中，李明轩和苏雨晴首次遭遇暗影领主的手下。虽然险象环生，但他们成功逃脱，并获得了重要的线索。',
        storyDate: '第5章',
        timeType: 'symbolic',
        chronOrder: 5,
        importance: 9,
        projectId: project.id
      },
      {
        name: '苏雨晴被困异时空',
        description: '在一次冒险中，苏雨晴被困在了异时空中。李明轩必须在24小时内找到她，这成为了整个故事的转折点。',
        storyDate: '第8章',
        timeType: 'symbolic',
        chronOrder: 8,
        importance: 8,
        projectId: project.id
      },
      {
        name: '张教授的发现',
        description: '张教授在研究古代文献时发现了关于时空之门的记录，为主角们提供了宝贵的理论支持和历史背景。',
        storyDate: '第3章',
        timeType: 'symbolic',
        chronOrder: 3,
        importance: 6,
        projectId: project.id
      },
      {
        name: '咖啡店的日常',
        description: '李明轩在咖啡店里思考人生和使命的日常场景。虽然看似平凡，但这些安静的时刻让读者更好地了解主角的内心世界。',
        storyDate: '第2章',
        timeType: 'symbolic',
        chronOrder: 2,
        importance: 4,
        projectId: project.id
      },
      {
        name: '小白的搞笑时刻',
        description: '小白在穿越过程中发生的各种搞笑事件，为紧张的剧情增添轻松元素，让读者在紧张之余能够放松一下。',
        storyDate: '各章节穿插',
        timeType: 'relative',
        chronOrder: 0,
        importance: 2,
        projectId: project.id
      }
    ];

    // 批量插入数据
    console.log('正在插入角色数据...');
    for (const character of characters) {
      await prisma.character.create({ data: character });
      console.log(`✓ 创建角色: ${character.name} (重要程度: ${character.importance})`);
    }

    console.log('\n正在插入世界设定数据...');
    for (const setting of worldSettings) {
      await prisma.worldSetting.create({ data: setting });
      console.log(`✓ 创建设定: ${setting.title} (重要程度: ${setting.importance})`);
    }

    console.log('\n正在插入时间线数据...');
    for (const timeline of timelines) {
      await prisma.timeline.create({ data: timeline });
      console.log(`✓ 创建时间线: ${timeline.name} (重要程度: ${timeline.importance})`);
    }

    console.log('\n🎉 测试数据插入完成！');
    console.log('\n背景色效果预览:');
    console.log('• 重要程度 8-10: 灰色背景 (bg-gray-100)');
    console.log('• 重要程度 6-7:  浅蓝背景 (bg-blue-50)');
    console.log('• 重要程度 4-5:  浅灰背景 (bg-gray-50)');
    console.log('• 重要程度 1-3:  白色背景 (bg-white)');

  } catch (error) {
    console.error('插入数据时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

insertTestData();