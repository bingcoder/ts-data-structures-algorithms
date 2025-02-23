# 堆


## 堆结构

<div class="svg-container">
  <svg id="heap"></svg>
</div>
<button id="heapifyButton" class="btn">开始堆化</button>

<input />

## 代码

<<< ./heap.ts

<script setup>

import { onMounted } from 'vue'
import { MinHeap } from './heap.ts'

onMounted(() => {


 const data = [15, 7, 19, 3, 12, 9, 2, 18, 14, 5, 20, 11]
      const svg = document.getElementById("heap");
      const nodeRadius = 20;
      const nodeSpacing = 80;

      let isAnimating = false;
      let animationStartTime;
      const duration = 1000; // 动画持续1秒

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

        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        text.setAttribute("x", x);
        text.setAttribute("y", y + 5);
        text.setAttribute("text-anchor", "middle");
        text.textContent = value;
        svg.appendChild(text);
      }

      function drawLine(x1, y1, x2, y2) {
        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("class", "line");
        svg.appendChild(line);
      }

      function startSwap(index1, index2) {
        // if (isAnimating) return;

        return new Promise((r) => {
          const node1 = svg.querySelectorAll("circle")[index1];
          const node2 = svg.querySelectorAll("circle")[index2];
          const text1 = svg.querySelectorAll("text")[index1];
          const text2 = svg.querySelectorAll("text")[index2];

          const x1 = parseFloat(node1.getAttribute("cx"));
          const x2 = parseFloat(node2.getAttribute("cx"));
          const y1 = parseFloat(node1.getAttribute("cy"));
          const y2 = parseFloat(node2.getAttribute("cy"));

          // 转换为数组索引（输入1对应索引0）

          isAnimating = true;
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

        const svgNS = "http://www.w3.org/2000/svg";
        const nodeRadius = 20;
        const verticalSpacing = 80;
        const horizontalSpacing = 80;

        // Calculate tree height
        const treeHeight = Math.ceil(Math.log2(arr.length + 1));

        console.log('tree height', treeHeight);
        svg.setAttribute('height', treeHeight * verticalSpacing)

        // Calculate node positions using BFS
        const positions = [];
        if (arr.length === 0) return;

        // Root node position
        // const svgWidth = Math.pow(2, treeHeight) * horizontalSpacing;
        const svgWidth = svg.clientWidth
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

        return
        // Draw connections first
        for (let i = 0; i < arr.length; i++) {
          if (!positions[i]) continue;

          // Draw line to left child
          const leftChild = 2 * i + 1;
          if (leftChild < arr.length && positions[leftChild]) {
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", positions[i].x);
            line.setAttribute("y1", positions[i].y);
            line.setAttribute("x2", positions[leftChild].x);
            line.setAttribute("y2", positions[leftChild].y);
            line.setAttribute("stroke", "black");
            svg.appendChild(line);
          }

          // Draw line to right child
          const rightChild = 2 * i + 2;
          if (rightChild < arr.length && positions[rightChild]) {
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", positions[i].x);
            line.setAttribute("y1", positions[i].y);
            line.setAttribute("x2", positions[rightChild].x);
            line.setAttribute("y2", positions[rightChild].y);
            line.setAttribute("stroke", "black");
            svg.appendChild(line);
          }
        }

        // Draw nodes
        for (let i = 0; i < arr.length; i++) {
          if (!positions[i]) continue;

          // Draw node circle
          const circle = document.createElementNS(svgNS, "circle");
          circle.setAttribute("cx", positions[i].x);
          circle.setAttribute("cy", positions[i].y);
          circle.setAttribute("r", nodeRadius);
          circle.setAttribute("fill", "white");
          circle.setAttribute("stroke", "black");
          svg.appendChild(circle);

          // Draw node text
          const text = document.createElementNS(svgNS, "text");
          text.setAttribute("x", positions[i].x);
          text.setAttribute("y", positions[i].y);
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("dominant-baseline", "middle");
          text.setAttribute("fill", "black");
          text.textContent = arr[i];
          svg.appendChild(text);
        }

        return;

        const positions1 = [];
        const levels = Math.floor(Math.log2(arr.length)) + 1;
        const startX = svg.clientWidth / 2;
        const startY = 50;

        // 重新计算每个节点的位置
        for (let i = 0; i < arr.length; i++) {
          const level = Math.floor(Math.log2(i + 1));
          const indexInLevel = i - (Math.pow(2, level) - 1);
          const count = Math.floor(Math.pow(2, level) / 2);

          console.log("count", i, level, count, indexInLevel);

          const x =
            startX +
            (indexInLevel >= count ? 1 : -1) *
              nodeSpacing *
              level *
              Math.abs(count - indexInLevel === 0 ? 1 : count - indexInLevel);
          const y = startY + level * nodeSpacing;
          positions.push({ x, y });
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

      // 在页面加载时展示初始数据的树形结构
      updateVisualization(data);

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

            console.log(ni, minIndex);

            if (minIndex === ni) break;

            orders.push([ni, minIndex]);
            const temp = items[ni];
            items[ni] = items[minIndex];
            items[minIndex] = temp;
            ni = minIndex;
          }
        }

        // console.log('items', items);

        return { originItems, items, orders };
      }

      // function buildHeap() {
      //   const n = data.length;
      //   for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      //     heapify(data, n, i);
      //   }
      //   updateVisualization(data); // 初始可视化
      // }

      async function buildMinHeap() {
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

        console.log("heapData", heapData);
      }

      document
        .getElementById("heapifyButton")
        .addEventListener("click", buildMinHeap);

})

</script>


<style scope>
  .btn {
    padding: 4px 8px;
    border-radius: 4px;
    border-color: var(--vp-button-alt-border);
    color: var(--vp-button-alt-text);
    background-color: var(--vp-button-alt-bg);
    margin-top: 10px
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
