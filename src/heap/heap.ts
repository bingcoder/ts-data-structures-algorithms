class Heap<T = number> {
	protected heapDataList: T[] = [];

	constructor(
		private compare: (a: T, b: T) => boolean,
		data?: Array<T>,
	) {
		if (data) {
			this.heapDataList = data;
			this.heapify();
		}
	}

	size() {
		return this.heapDataList.length;
	}

	private swap(a: number, b: number) {
		const temp = this.heapDataList[a];
		this.heapDataList[a] = this.heapDataList[b];
		this.heapDataList[b] = temp;
	}

	private getParentIndex(index: number) {
		// return Math.floor((index - 1) / 2);
		return (index - 1) >>> 1;
	}

	private getLeftChildIndex(index: number) {
		return index * 2 + 1;
	}

	private getRightChildIndex(index: number) {
		return (index + 1) * 2;
	}

	private getLeftChild(index: number) {
		return this.heapDataList[this.getLeftChildIndex(index)];
	}

	private getRightChild(index: number) {
		return this.heapDataList[this.getRightChildIndex(index)];
	}

	check() {
		this.heapDataList.forEach((item, index) => {
			const leftChild = this.getLeftChild(index);
			const rightChild = this.getRightChild(index);
			if (leftChild) {
				if (this.compare(item, leftChild)) {
					throw new Error('left child compare error');
				}
				if (this.compare(item, rightChild)) {
					throw new Error('left child compare error');
				}
			}
		});
	}

	private siftDown(index = 0) {
		let ni = index;
		const maxIndex = this.size() - 1;

		while (true) {
			let minIndex = ni;
			const leftChildIndex = minIndex * 2 + 1;
			const rightChildIndex = leftChildIndex + 1;
			if (
				leftChildIndex <= maxIndex &&
				this.compare(
					this.heapDataList[minIndex],
					this.heapDataList[leftChildIndex],
				)
			) {
				minIndex = leftChildIndex;
			}
			if (
				rightChildIndex <= maxIndex &&
				this.compare(
					this.heapDataList[minIndex],
					this.heapDataList[rightChildIndex],
				)
			) {
				minIndex = rightChildIndex;
			}

			if (minIndex === ni) break;
			this.swap(ni, minIndex);
			ni = minIndex;
		}
	}

	private heapify() {
		const maxIndex = this.size() - 1;
		// 从最后一个非叶子节点开始，自上而下式堆化
		for (let i = this.getParentIndex(maxIndex); i >= 0; --i) {
			this.siftDown(i);
		}
	}

	peek() {
		return this.size() ? this.heapDataList[0] : null;
	}

	push(data: T) {
		let dataIndex = this.size();
		this.heapDataList.push(data);
		while (dataIndex > 0) {
			const parentIndex = this.getParentIndex(dataIndex);
			if (
				this.compare(
					this.heapDataList[parentIndex],
					this.heapDataList[dataIndex],
				)
			) {
				this.swap(parentIndex, dataIndex);
				dataIndex = parentIndex;
			} else {
				return;
			}
		}
	}

	pop() {
		const firstNode = this.heapDataList.shift();
		if (!firstNode || this.size() <= 1) {
			return firstNode;
		}
		// >=2
		const lastNode = this.heapDataList.pop() as T;
		this.heapDataList.unshift(lastNode);

		this.siftDown();
	}
}

export class MinHeap extends Heap {
	constructor(data?: Array<number>) {
		super((a, b) => a > b, data);
	}
}

export class MaxHeap extends Heap {
	constructor(data?: Array<number>) {
		super((a, b) => a > b, data);
	}
}
