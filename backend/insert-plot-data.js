const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function insertPlotData() {
  try {
    // 获取项目
    let project = await prisma.project.findFirst();
    
    if (!project) {
      console.log('没有找到项目，请先运行 insert-test-data.js');
      return;
    }

    console.log('使用项目:', project.title, '(ID:', project.id, ')');

    // 创建层级化的情节结构
    const plotData = [
      {
        title: '时空穿越者',
        summary: '一个关于时空穿越的奇幻冒险故事，讲述了一个普通大学生意外获得穿越能力后的成长历程。',
        type: 'book',
        status: 'outlined',
        order: 1,
        wordCount: 0,
        targetWords: 200000,
        projectId: project.id,
        parentId: null,
        children: [
          {
            title: '第一部：觉醒',
            summary: '主角李明轩发现自己的穿越能力，开始探索这个神秘的世界。',
            type: 'part',
            status: 'outlined',
            order: 1,
            wordCount: 0,
            targetWords: 80000,
            children: [
              {
                title: '第一章：意外的发现',
                summary: '李明轩在大学图书馆地下室意外发现了时空之门。',
                type: 'chapter',
                status: 'drafted',
                order: 1,
                
                wordCount: 3500,
                targetWords: 4000,
                mood: '神秘、紧张',
                pov: '第三人称',
                children: [
                  {
                    title: '图书馆的秘密',
                    summary: '李明轩在查找资料时发现了隐藏的地下室入口。',
                    type: 'scene',
                    status: 'completed',
                    order: 1,
                    
                    wordCount: 1200,
                    targetWords: 1200,
                    mood: '好奇、探索'
                  },
                  {
                    title: '时空之门的显现',
                    summary: '古老的符文开始发光，时空之门缓缓打开。',
                    type: 'scene',
                    status: 'completed',
                    order: 2,
                    
                    wordCount: 1500,
                    targetWords: 1500,
                    mood: '震撼、恐惧'
                  },
                  {
                    title: '初次穿越',
                    summary: '李明轩被吸入时空之门，来到了古代。',
                    type: 'scene',
                    status: 'drafted',
                    order: 3,
                    
                    wordCount: 800,
                    targetWords: 1300,
                    mood: '混乱、惊恐'
                  }
                ]
              },
              {
                title: '第二章：古代的邂逅',
                summary: '李明轩在古代遇到了苏雨晴的前世，开始了解时空穿越的规则。',
                type: 'chapter',
                status: 'outlined',
                order: 2,
                
                wordCount: 0,
                targetWords: 4500,
                mood: '浪漫、神秘',
                pov: '第三人称',
                children: [
                  {
                    title: '古代集市',
                    summary: '李明轩在古代集市中迷失方向，观察古代生活。',
                    type: 'scene',
                    status: 'planned',
                    order: 1,
                    
                    wordCount: 0,
                    targetWords: 1500,
                    mood: '新奇、困惑'
                  },
                  {
                    title: '命运的相遇',
                    summary: '李明轩遇到了苏雨晴的前世——古代才女林诗韵。',
                    type: 'scene',
                    status: 'planned',
                    order: 2,
                    
                    wordCount: 0,
                    targetWords: 2000,
                    mood: '惊喜、命运感'
                  },
                  {
                    title: '时间的警告',
                    summary: '李明轩感受到时空之力的召唤，必须返回现代。',
                    type: 'scene',
                    status: 'planned',
                    order: 3,
                    
                    wordCount: 0,
                    targetWords: 1000,
                    mood: '紧迫、不舍'
                  }
                ]
              },
              {
                title: '第三章：现实的冲击',
                summary: '李明轩回到现代，开始思考穿越的意义和责任。',
                type: 'chapter',
                status: 'planned',
                order: 3,
                
                wordCount: 0,
                targetWords: 3800,
                mood: '反思、成长',
                pov: '第三人称'
              }
            ]
          },
          {
            title: '第二部：探索',
            summary: '李明轩开始主动探索不同的时空，寻找穿越的真相。',
            type: 'part',
            status: 'planned',
            order: 2,
            
            wordCount: 0,
            targetWords: 70000,
            children: [
              {
                title: '第四章：伙伴的加入',
                summary: '苏雨晴发现了李明轩的秘密，决定一起探索时空的奥秘。',
                type: 'chapter',
                status: 'planned',
                order: 1,
                
                wordCount: 0,
                targetWords: 4200,
                mood: '合作、信任',
                pov: '第三人称'
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
                pov: '第三人称'
              }
            ]
          },
          {
            title: '第三部：决战',
            summary: '最终的对决，李明轩必须面对暗影领主，拯救所有时空。',
            type: 'part',
            status: 'planned',
            order: 3,
            
            wordCount: 0,
            targetWords: 50000
          }
        ]
      }
    ];

    // 递归插入数据
    async function insertPlotElement(plotElement, parentId = null) {
      const { children, ...elementData } = plotElement;
      
      const created = await prisma.plotElement.create({
        data: {
          ...elementData,
          parentId
        }
      });

      console.log(`✓ 创建情节: ${created.title} (类型: ${created.type}, 重要程度: ${created.importance})`);

      if (children && children.length > 0) {
        for (const child of children) {
          await insertPlotElement(child, created.id);
        }
      }

      return created;
    }

    console.log('正在插入情节数据...');
    for (const plotElement of plotData) {
      await insertPlotElement(plotElement);
    }

    console.log('\n🎉 情节数据插入完成！');
    console.log('\n层级结构预览:');
    console.log('📚 书 → 📖 部 → 📄 章 → 🎬 场景 → 🎵 节拍');
    console.log('\n背景色效果:');
    console.log('• 重要程度 8-10: 灰色背景 (bg-gray-100)');
    console.log('• 重要程度 6-7:  石板灰背景 (bg-slate-50)');
    console.log('• 重要程度 4-5:  浅灰背景 (bg-gray-50)');
    console.log('• 重要程度 1-3:  白色背景 (bg-white)');

  } catch (error) {
    console.error('插入情节数据时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

insertPlotData();