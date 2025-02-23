<template>
  <div class="vp-container">
    数据：{{ data }}
    <svg ref="heap"></svg>
    <div class="refresh-btn">
      <button :class="{ refresh: true, refreshing: refresh }" @click="handleRefresh"></button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
const data = [15, 7, 19, 3, 12, 9, 2, 18, 14, 5, 20, 11];
const nodeRadius = 20;
const verticalSpacing = 80;
const refresh = ref(false);
const heap = ref();
let svg;
let refreshId = 0;
let animationStartTime;
let isAnimating = false
const duration = 1000; // 动画持续1秒

const handleRefresh = () => {
  if (isAnimating) return;

  refresh.value = true;
  updateVisualization(data)
  buildMinHeap(data)
  setTimeout(() => {
    refresh.value = false;
  }, 1000);
};

function drawNode(x, y, value) {
  const node = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  node.setAttribute("cx", x);
  node.setAttribute("cy", y);
  node.setAttribute("r", nodeRadius);
  node.setAttribute("class", "node");
  svg.appendChild(node);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", x);
  text.setAttribute("y", y + 5);
  text.setAttribute("text-anchor", "middle");
  text.textContent = value;
  svg.appendChild(text);
}

function drawLine(x1, y1, x2, y2) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("class", "line");
  svg.appendChild(line);
}

function startSwap(index1, index2) {
  return new Promise((r) => {
    const node1 = svg.querySelectorAll("circle")[index1];
    const node2 = svg.querySelectorAll("circle")[index2];
    const text1 = svg.querySelectorAll("text")[index1];
    const text2 = svg.querySelectorAll("text")[index2];

    const x1 = parseFloat(node1.getAttribute("cx"));
    const x2 = parseFloat(node2.getAttribute("cx"));
    const y1 = parseFloat(node1.getAttribute("cy"));
    const y2 = parseFloat(node2.getAttribute("cy"));

    animationStartTime = performance.now();

    // 记录初始位置

    function animate(timestamp) {
      const elapsed = timestamp - animationStartTime;
      const progress = Math.min(elapsed / duration, 1);

      // 使用缓动函数提升动画效果
      const easeProgress =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      // 更新位置
      const currentX1 = x1 + (x2 - x1) * easeProgress;
      const currentY1 = y1 + (y2 - y1) * easeProgress;
      const currentX2 = x2 + (x1 - x2) * easeProgress;
      const currentY2 = y2 + (y1 - y2) * easeProgress;

      node1.setAttribute("cx", currentX1);
      node1.setAttribute("cy", currentY1);
      text1.setAttribute("x", currentX1);
      text1.setAttribute("y", currentY1 + 5);

      node2.setAttribute("cx", currentX2);
      node2.setAttribute("cy", currentY2);
      text2.setAttribute("x", currentX2);
      text2.setAttribute("y", currentY2 + 5);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        r();
      }
    }

    requestAnimationFrame(animate);
  });
}

function updateVisualization(arr) {
  // 清除现有节点和线条
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }

  const treeHeight = Math.ceil(Math.log2(arr.length + 1));
  svg.setAttribute("height", treeHeight * verticalSpacing + 20);
  const positions = [];
  if (arr.length === 0) return;

  const svgWidth = svg.clientWidth;
  const svgHeight = treeHeight * verticalSpacing + 100;
  positions[0] = { x: svgWidth / 2, y: 50 };

  const queue = [0];
  while (queue.length > 0) {
    const i = queue.shift();
    const level = Math.floor(Math.log2(i + 1));
    const currentSpacing = svgWidth / Math.pow(2, level + 2);

    // Left child
    const leftIdx = 2 * i + 1;
    if (leftIdx < arr.length) {
      positions[leftIdx] = {
        x: positions[i].x - currentSpacing,
        y: positions[i].y + verticalSpacing,
      };
      queue.push(leftIdx);
    }

    // Right child
    const rightIdx = 2 * i + 2;
    if (rightIdx < arr.length) {
      positions[rightIdx] = {
        x: positions[i].x + currentSpacing,
        y: positions[i].y + verticalSpacing,
      };
      queue.push(rightIdx);
    }
  }

  // 重新绘制线条
  for (let i = 0; i < arr.length; i++) {
    const parentIndex = Math.floor((i - 1) / 2);
    if (parentIndex >= 0) {
      drawLine(
        positions[parentIndex].x,
        positions[parentIndex].y,
        positions[i].x,
        positions[i].y
      );
    }
  }

  // 重新绘制节点
  for (let i = 0; i < arr.length; i++) {
    drawNode(positions[i].x, positions[i].y, arr[i]);
  }
}
function buildHeap(originItems) {
  const items = [...originItems];
  const orders = [];
  const maxIndex = items.length - 1;
  // 从最后一个非叶子节点开始，自上而下式堆化
  for (let i = (maxIndex - 1) >>> 1; i >= 0; --i) {
    let ni = i;
    // 自上而下式堆化
    while (true) {
      let minIndex = ni;
      const leftChildIndex = minIndex * 2 + 1;
      const rightChildIndex = leftChildIndex + 1;
      if (
        leftChildIndex <= maxIndex &&
        items[minIndex] > items[leftChildIndex]
      ) {
        minIndex = leftChildIndex;
      }
      if (
        rightChildIndex <= maxIndex &&
        items[minIndex] > items[rightChildIndex]
      ) {
        minIndex = rightChildIndex;
      }

      if (minIndex === ni) break;

      orders.push([ni, minIndex]);
      const temp = items[ni];
      items[ni] = items[minIndex];
      items[minIndex] = temp;
      ni = minIndex;
    }
  }

  return { originItems, items, orders };
}

async function buildMinHeap(data) {
  isAnimating = true
  const newData = [...data];
  const heapData = buildHeap(data);
  for (let index = 0; index < heapData.orders.length; index++) {
    const element = heapData.orders[index];
    await startSwap(element[0], element[1]);
    const temp = newData[element[0]];
    newData[element[0]] = newData[element[1]];
    newData[element[1]] = temp;
    updateVisualization(newData);
  }
  isAnimating = false
}

onMounted(() => {
  svg = heap.value;
  // 在页面加载时展示初始数据的树形结构
  updateVisualization(data);

  setTimeout(() => {
    buildMinHeap(data);
  }, 1000);
});

</script>

<style scope lang="less">
.vp-container {
  border-radius: 8px;
  margin: 16px 0;
  position: relative;
  background-color: var(--vp-code-block-bg);
  overflow-x: auto;
  transition: background-color 0.5s;

  .refresh-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 3;
    border: 1px solid var(--vp-code-copy-code-border-color);
    border-radius: 4px;
    background-color: var(--vp-code-copy-code-bg);
    opacity: 0;
    transition: all 0.25s;

    &:hover {
      border-color: var(--vp-code-copy-code-hover-border-color);
      background-color: var(--vp-code-copy-code-hover-bg);
    }
  }


  .refresh {
    display: block;
    width: 40px;
    height: 40px;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg t='1740308565607' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='1679' id='mx_n_1740308565608' width='40' height='40'%3E%3Cpath d='M576.3 157.6c-174.3 0-318.9 128-345.7 294.8L175.2 397c-17.6-17.7-46.3-17.7-64 0-17.7 17.7-17.7 46.3 0 64l134.3 134.3c8.8 8.8 20.4 13.3 32 13.3 1.1 0 2.2-0.2 3.3-0.3 1.1 0.1 2.2 0.3 3.3 0.3 11.6 0 23.2-4.4 32-13.3L450.4 461c17.7-17.7 17.7-46.3 0-64-17.7-17.7-46.3-17.7-64 0l-66 66c21.5-121.9 127.9-214.9 255.9-214.9 143.4 0 260.1 116.7 260.1 260.1 0 143.4-116.7 260.1-260.1 260.1-64.9 0-127-24-175-67.6-18.5-16.8-47.1-15.5-63.9 3-16.8 18.5-15.5 47.1 3 63.9 64.7 58.8 148.4 91.2 235.9 91.2 193.3 0 350.6-157.3 350.6-350.6S769.7 157.6 576.3 157.6z' p-id='1680' fill='%23808080'%3E%3C/path%3E%3C/svg%3E");
    background-position: 50%;
    background-size: 20px;
    background-repeat: no-repeat;
    transition: all 0.25s;

    &.refreshing {
      transform: rotate(-360deg);
    }
  }

  &:hover .refresh-btn {
    opacity: 1;
  }
}

.btn {
  padding: 4px 8px;
  border-radius: 4px;
  border-color: var(--vp-button-alt-border);
  color: var(--vp-button-alt-text);
  background-color: var(--vp-button-alt-bg);
  margin-top: 10px;
}

.svg-container {
  height: 360px;
  overflow: auto;
  border-radius: 8px;
  background-color: var(--vp-code-block-bg);
}

svg {
  width: 100%;
}

.node {
  fill: lightblue;
  stroke: black;
  stroke-width: 1px;
}

.line {
  stroke: black;
  stroke-width: 1px;
}
</style>
